/* ------------
Kernel.ts
Requires globals.ts
Routines for the Operating System, NOT the host.
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
var TSOS;
(function (TSOS) {
    var Kernel = (function () {
        function Kernel() {
        }
        //
        // OS Startup and Shutdown Routines
        //
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;

            //Initialize Ready Queue for the Processes to be loaded
            _ReadyQueue = new TSOS.Queue();
            _TerminatedQueue = new Array();

            //Initialize Resident Queue
            _ResidentQueue = new Array();
            _CurrentScheduler = new TSOS.Scheduler("rr");

            //Initialize the Memory Manager
            _MemoryManager = new TSOS.MemoryManager();
            document.getElementById("tableID").style.visibility = "visible";

            //Initialize and load file system Device Driver
            _FileSystem = new TSOS.FileSystem();
            _FileSystem.launch();
            this.krnTrace("Loading the File System device driver.");

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };

        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");

            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        };

        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
            This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
            This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
            that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                _Mode = 0;
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting && (_CurrentSchedule == "fcfs" || _CurrentSchedule == "priority")) {
                _CPU.cycle();
                TSOS.Shell.updateReadyQueue();
            } else if (_CPU.isExecuting && (_CurrentSchedule == "rr")) {
                if (_ClockCycle >= _Quantum) {
                    _Mode = 0;
                    _ClockCycle = 0;
                    TSOS.Shell.updateReadyQueue();
                    this.krnInterruptHandler(_ContextSwitch, 0);
                } else {
                    _CPU.cycle();
                    _ClockCycle++;
                    TSOS.Shell.updateReadyQueue();
                }
            } else {
                this.krnTrace("Idle");
                _Mode = 1;
            }
        };

        //
        // Interrupt Handling
        //
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };

        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            _Mode = 0;
            this.krnTrace("Handling IRQ~" + irq);

            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case _NextButton:
                    this.handleNextButton();
                    break;
                case _SystemCall:
                    this.systemCall(params);
                    break;
                case _Break:
                    this.breakCall();
                    break;
                case _InvalidOpCode:
                    _StdOut.putText("WTF is this Instruction?");
                    _CPU.reset();
                    break;
                case _RUN:
                    //what if something is already running...?
                    if (_CPU.isExecuting) {
                        _ReadyQueue.enqueue(params);
                    } else {
                        _ReadyQueue.enqueue(params);
                        this.startScheduler();
                    }
                    break;
                case _RUNALL:
                    document.getElementById("processesDiv").style.visibility = "visible";
                    this.startScheduler();
                    break;
                case _ContextSwitch:
                    this.contextSwitch();
                    break;
                case _Killed:
                    this.krnTrace("\n\nKILLING PID: " + params.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                    break;
                case _MemoryBoundError:
                    _StdOut.putText("Memory Limit Reached for PID: " + params.getPid());

                    //throw a bsod
                    params.setState(4);
                    _ClockCycle = 0;
                    _CPU.reset();
                    this.bsod("Illegal Memory Access");
                    this.krnShutdown();
                    break;
                case _KilledReset:
                    params.setState(5);
                    _StdOut.putText("Killed PID: " + params.getPid());
                    TSOS.Shell.updateReadyQueue();
                    _CPU.reset();
                    _ClockCycle = 0;
                    break;
                case _KilledRunAll:
                    _ClockCycle = 0;
                    params.setState(5);
                    _StdOut.putText("Killed PID: " + params.getPid());
                    TSOS.Shell.updateReadyQueue();
                    this.startScheduler();
                    break;
                case _BSOD:
                    this.bsod(params);
                    break;
                    break;
                case _READ:
                    _FileSystem.read(params);
                    break;
                case _CREATE:
                    _FileSystem.createFile(params.toString());
                    break;
                case _DELETE:
                    _FileSystem.deleteFile(params);
                    break;
                case _LS:
                    _FileSystem.fileDirectory();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };

        Kernel.prototype.krnTimerISR = function () {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        };

        Kernel.prototype.rollIn = function (process) {
            _FileSystem.rollIn(_CurrentProcess, process); //swap processes and delete if "terminated"
        };

        /**
        * Handles System Call
        * @param params
        */
        Kernel.prototype.systemCall = function (params) {
            if (params == 1) {
                _StdOut.putText(_CPU.Yreg.toString());
            }
            if (params == 2) {
                var address = _CPU.Yreg;
                var print = "";
                var temp = parseInt(_MemoryManager.read(address), 16);
                var index = 0;
                while (temp != "00") {
                    print += String.fromCharCode(temp).toString();
                    index++;
                    temp = parseInt(_MemoryManager.read(parseInt(index + address)), 16);
                }
                _StdOut.putText(print);
            }
            _Console.advanceLine();
            _OsShell.putPrompt();
        };

        //
        // OS Utility Routines
        //
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                } else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };

        Kernel.prototype.krnTrapError = function (msg) {
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);

            // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            this.krnShutdown();
        };

        /**
        * Context Switches to the next process after saving the current state
        */
        Kernel.prototype.contextSwitch = function () {
            if (_ReadyQueue.isEmpty() && (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed")) {
                _CPU.reset();
            } else {
                _CurrentProcess.setPc(_CPU.PC);
                _CurrentProcess.setAcc(_CPU.Acc);
                _CurrentProcess.setX(_CPU.Xreg);
                _CurrentProcess.setY(_CPU.Yreg);
                _CurrentProcess.setZ(_CPU.Zflag);
                _CurrentProcess.setIr(_CPU.IR);
                _CurrentProcess.setState(2); //set state to waiting

                //push back onto the queue
                _ReadyQueue.enqueue(_CurrentProcess);
                _CurrentProcess = _ReadyQueue.dequeue();

                if (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed") {
                    this.startScheduler();
                    return;
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    this.contextSwitchDisk(true, false, false);
                    return;
                }
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                TSOS.Shell.updateReadyQueue();
            }
        };

        /**
        * Gets the next block before getting the current-process
        * contents from the disk
        * @returns {any}
        */
        Kernel.prototype.getNextAvailableBlock = function () {
            var index = _ResidentQueue.indexOf(_CurrentProcess);
            var nextProcess = _ResidentQueue[index];
            while (nextProcess.getLocation() != "Memory") {
                index++;
                if (index >= _ResidentQueue.length) {
                    index = 0;
                }
                nextProcess = _ResidentQueue[index];
            }
            if (nextProcess.getState() == "Killed" || nextProcess.getState() == "Terminated") {
                _ResidentQueue.splice(_ResidentQueue.indexOf(nextProcess), 1);
            }
            return nextProcess;
        };

        /**
        * This gets called whenever
        * we need to load a process
        * from the disk.
        * @param rr
        * @param fcfs
        * @param priority
        */
        Kernel.prototype.contextSwitchDisk = function (rr, fcfs, priority) {
            if (rr) {
                _ClockCycle = 0;
                var nextProcess = this.getNextAvailableBlock();
                _FileSystem.rollIn(_CurrentProcess, nextProcess); //swap processes and delete if "terminated"
                _Kernel.krnTrace("\nRolling In " + _CurrentProcess.getPid() + " from Disk" + "\n");
                TSOS.Shell.updateReadyQueue();
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
            }
            if (fcfs) {
                _CurrentProcess.setLocation("Memory");
                _CurrentProcess.setPrintLocation("Memory");

                //set the least process stored to "TRASH"
                this.setToTrash();
                _FileSystem.swap(_CurrentProcess, (_BlockSize / _BlockSize) - 1);
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                TSOS.Shell.updateReadyQueue();
            }
            if (priority) {
                _CurrentProcess.setLocation("Memory");
                _CurrentProcess.setPrintLocation("Disk -> Memory");

                //set the least process stored to "TRASH"
                this.setToTrash();
                _FileSystem.swap(_CurrentProcess, (_BlockSize / _BlockSize) - 1);
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                TSOS.Shell.updateReadyQueue();
            }
        };

        /**
        * Finds next process in ready queue whose state == "Memory"
        * and sets the state to "Trash"
        */
        Kernel.prototype.setToTrash = function () {
            var process;
            for (var i = 0; i < _ResidentQueue.length; i++) {
                process = _ResidentQueue[i];
                if (process.getLocation() == "Memory" && process.getState() == "Terminated") {
                    process.setLocation("Trash");
                    process.setPrintLocation("Memory -> Trash");
                    break;
                }
            }
        };

        Kernel.prototype.breakCall = function () {
            _CPU.reset(); //Re-Start the CPU!
            _CurrentProcess.setState(4);
            _CurrentProcess.setTimeFinished(_OSclock);
            TSOS.Pcb.displayTimeMonitor();
            _ClockCycle = 0;
            _Kernel.krnTrace("\n\nTERMINATING PID: " + _CurrentProcess.getPid() + "\n");
            TSOS.Shell.updateReadyQueue();
            if (_ReadyQueue.isEmpty()) {
                _ResidentQueue.splice(0, _ResidentQueue.length);
                _Memory.clearMemory();
            }
            this.startScheduler(); //start over
        };

        /**
        * Handles Single Step
        */
        Kernel.prototype.handleNextButton = function () {
            _CurrentProcess.setState(1);
            _CPU.cycle();
            _StepButton = false;
            TSOS.Shell.updateReadyQueue();
        };

        /**
        * Throws a BSOD Error.
        */
        Kernel.prototype.bsod = function (message) {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _DrawingContext.drawText("sans", 20, 50, 150, message);
            _DrawingContext.drawText("sans", 20, 50, 250, "Why do you think this happened?");
            _CPU.reset();
            this.krnShutdown();
        };

        Kernel.prototype.startScheduler = function () {
            if (_CurrentSchedule == "rr") {
                _ClockCycle = 0;
                _CurrentScheduler.rr();
            } else if (_CurrentSchedule == "fcfs") {
                _CurrentScheduler.fcfs();
            } else {
                _CurrentScheduler.priority();
            }
        };
        return Kernel;
    })();
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
