///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = "=>";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Displays where am I.");
            this.commandList[this.commandList.length] = sc;

            //surprise
            sc = new ShellCommand(this.shellSurprise,
                "surprise",
                "- Surprises you with my favorite number.");
            this.commandList[this.commandList.length] = sc;

            //BSOD
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Are you sure you wanna try this?.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "<string> - Loads a program in hex into the system.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "- Changes the status message specified by User.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - Executes the current pid from Memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all the partitions in the memory");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- <number> - Set the Quantum.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                "ps",
                "- Prints all the active Processes.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- <pid> Allows the user to kill an active process");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Runs all the Processes in the Resident Queue.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.ShellFormat,
                "format",
                "- Formats the File System.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new ShellCommand(this.ShellCreate,
                "create",
                "- <string> Creates a file in the file system.");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new ShellCommand(this.ShellWrite,
                "write",
                "- <string> writes the contents to the filename");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new ShellCommand(this.ShellRead,
                "read",
                "- <string> Reads the contents of the filename");
            this.commandList[this.commandList.length] = sc;


            // delete
            sc = new ShellCommand(this.ShellDelete,
                "delete",
                "- <string> Deletes the file and its contents");
            this.commandList[this.commandList.length] = sc;


            // ls
            sc = new ShellCommand(this.ShellLs,
                "ls",
                "- <string> List of the Active Files");
            this.commandList[this.commandList.length] = sc;

            // setschedule
            sc = new ShellCommand(this.ShellSetSchedule,
                "setschedule",
                "- [rr,fcfs,priority] Sets the current schedule.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.ShellGetSchedule,
                "getschedule",
                "- Gets the current schedule");
            this.commandList[this.commandList.length] = sc;
            // processes - list the running processes and their IDs
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        /**
         * Renders the OS Name and Version.
         * @param args
         */
        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        /**
         * Renders the current Date Object.
         */
        public shellDate(){
            _StdOut.putText("" + new Date().toDateString() + " " + new Date().toLocaleTimeString());
        }

        /**
         * Prints PI.
         */
        public shellSurprise(){
            _StdOut.putText("My favorite number is " + Math.PI);
        }

        /**
         * Prints the location.
         */
        public shellWhereami(){
            _StdOut.putText("Why don't you turn around.");
        }

        /**
         * Draws a blue screen over the canvas.
         */
        public shellBSOD(){
            _KernelInterruptQueue.enqueue(new Interrupt(_BSOD,"BSOD"));
        }

        /**
         * Loads the user input program if any,
         * and validates HEX (at the moment).
         */
        public shellLoad(args){
            var f =  document.getElementById("taProgramInput").value;
            var x = f.replace(/\s/g,'');

            if(x.length == 0 || x.length % 2 !=0){
                _StdOut.putText("Invalid Input!");
                return;
            }

            for(var i=0; i<x.length;i++){
                var temp = x.charCodeAt(i);

                if((temp == 32) || (temp >=65 && temp<=70) || (temp >=48 && temp<=57) || (temp >=97 && temp <=102)){
                    continue;
                }else{
                    _StdOut.putText("FOUND INVALID HEX CHARACTER!");
                    return;
                }
            }

            if((x.toString().length/2) > (_BlockSize)){
                _StdOut.putText("Too big to fit into the Memory block");
                return;
            }

//            Get the free block first!
            var base = _MemoryManager.getBlockAvailable();
            var process;
            var pro:string = args[0];
            var priority:number;

            if(pro == undefined || pro < 0){
                priority = 10;
            }

            if(base != -1) {
                //Create New PCB and don't forget the priority
                process = new Pcb(base, (base + 255), priority);
                process.setLength((x.length / 2)); //set the length of the program.
                process.setState(7);//set state "NEW"
                process.setLocation("Memory");
                process.setPrintLocation("Memory");

                //Load in the Resident Queue
                _ResidentQueue.push(process);
                //Push on Fake because Resident Queue expands and shrinks
                //This is also my Terminated Queue!
                _TerminatedQueue.push(process);

                //Print to Console
                _StdOut.putText("Loaded Successfully!");
                _Console.advanceLine();
                _StdOut.putText("Process ID: " + process.getPid());
                //Finally load into Memory
                _MemoryManager.load(base, x.toUpperCase().toString());
            }else{
                //Base is -1 at this point.
                //so need to store into the file system.
                //check..formatted first!
                if(_FileSystem.isFormatted()){
                    process = new Pcb(-1,-1,priority);
                    process.setLocation("Disk");
                    process.setPrintLocation("Disk");
                    process.setState(7);//set state "NEW"
                    process.setLength((x.length / 2));
                    process.setLocation("Disk");
                    var filename:string = ("swap"+process.getPid());
                    var loaded : boolean =  _FileSystem.rollOut(filename,x.toUpperCase().toString());
                    if(loaded){
                        _StdOut.putText("Loaded Successfully!");
                        _Console.advanceLine();
                        _StdOut.putText("Process ID: " + process.getPid());
                        _ResidentQueue.push(process);
                        _TerminatedQueue.push(process);
                    }else{
                        _StdOut.putText("Not enough space to load anymore!");
                    }
                }else{
                    _StdOut.putText("File System not Formatted!");
                }
            }
        }

        /**
         * Updates the Ready Queue Table
         */
        public static updateReadyQueue(){

            var tableView = "<table>";
            tableView +="<th>PID</th>";
            tableView +="<th>Block</th>";
            tableView +="<th>Base</th>";
            tableView +="<th>Limit</th>";
            tableView +="<th>State</th>";
            tableView +="<th>PC</th>";
            tableView +="<th>IR</th>";
            tableView +="<th>Acc</th>";
            tableView +="<th>XReg</th>";
            tableView +="<th>YReg</th>";
            tableView +="<th>ZReg</th>";
            tableView +="<th>Location</th>";
            tableView +="<th>Priority</th>";

            for(var i = _TerminatedQueue.length-1; i>=0;i--) {

                var s:TSOS.Pcb = _TerminatedQueue[i];

                if(s.getState() == "Running") {
                    tableView += "<tr style='background-color: limegreen;'>";
                    tableView += "<td>" + s.getPid().toString() + "</td>";
                    tableView += "<td>" + s.getBlock().toString() + "</td>";
                    tableView += "<td>" + s.getBase().toString() + "</td>";
                    tableView += "<td>" + s.getLimit().toString() + "</td>";
                    tableView += "<td>" + s.getState().toString() + "</td>";
                    tableView += "<td>" + s.getPc()+ "</td>";
                    tableView += "<td>" + s.getIR() + "</td>";
                    tableView += "<td>" + s.getAcc() + "</td>";
                    tableView += "<td>" + s.getX() + "</td>";
                    tableView += "<td>" + s.getY() + "</td>";
                    tableView += "<td>" + s.getZ() + "</td>";
                    tableView += "<td>" + s.getPrintLocation() + "</td>";
                    tableView += "<td>" + s.getPriority() + "</td>";
                    tableView += "</tr>";
                }
                if (s.getState() == "Terminated" || s.getState() == "Killed"){
                    tableView += "<tr style='background-color: red;'>";
                    tableView += "<td>" + s.getPid().toString() + "</td>";
                    tableView += "<td>" + s.getBlock().toString() + "</td>";
                    tableView += "<td>" + s.getBase().toString() + "</td>";
                    tableView += "<td>" + s.getLimit().toString() + "</td>";
                    tableView += "<td>" + s.getState().toString() + "</td>";
                    tableView += "<td>" + s.getPc() + "</td>";
                    tableView += "<td>" + s.getIR() + "</td>";
                    tableView += "<td>" + s.getAcc() + "</td>";
                    tableView += "<td>" + s.getX() + "</td>";
                    tableView += "<td>" + s.getY() + "</td>";
                    tableView += "<td>" + s.getZ() + "</td>";
                    tableView += "<td>" + s.getPrintLocation() + "</td>";
                    tableView += "<td>" + s.getPriority() + "</td>";
                    tableView += "</tr>";
                }

                if (s.getState() == "Waiting"){

                    if(s.getLocation() == "Memory"){
                        tableView += "<tr style='background-color:rgb(255, 196, 45);'>";
                        tableView += "<td style='color: #000000;'>" + s.getPid().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getBlock().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getBase().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getLimit().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getState().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getPc() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getIR() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getAcc() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getX() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getY() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getZ() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getPrintLocation()+ "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getPriority()+ "</td>";
                        tableView += "</tr>";
                    }else{
                        tableView += "<tr style='background-color: rgb(255, 196, 45);'>";
                        tableView += "<td style='color: firebrick;'>" + s.getPid().toString() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getBlock().toString() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getBase().toString() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getLimit().toString() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getState().toString() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getPc() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getIR() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getAcc() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getX() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getY() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getZ() + "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getPrintLocation()+ "</td>";
                        tableView += "<td style='color: firebrick;'>" + s.getPriority()+ "</td>";
                        tableView += "</tr>";
                    }

                }

                if (s.getState() == "Ready"){
                    tableView += "<tr style='background-color: darkturquoise;'>";
                    tableView += "<td style='color: #000000;'>" + s.getPid().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getBlock().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getBase().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getLimit().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getState().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getPc() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getIR() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getAcc() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getX() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getY() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getZ() + "</td>";
                    tableView += "<td style='color: #000000;'>" +s.getPrintLocation() + "</td>";
                    tableView += "<td style='color: #000000;'>" +s.getPriority() + "</td>";
                    tableView += "</tr>";
                }

                if (s.getState() == "New"){
                    tableView += "<tr style='background-color: #E66C2C;'>";
                    tableView += "<td style='color: #000000;'>" + s.getPid().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getBlock().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getBase().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getLimit().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getState().toString() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getPc() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getIR() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getAcc() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getX() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getY() + "</td>";
                    tableView += "<td style='color: #000000;'>" + s.getZ() + "</td>";
                    tableView += "<td style='color: #000000;'>" +s.getPrintLocation() + "</td>";
                    tableView += "<td style='color: #000000;'>" +s.getPriority() + "</td>";
                    tableView += "</tr>";
                }
            }
            tableView += "</table>";
            document.getElementById("displayReady").innerHTML = tableView;
        }

        /**
         * Changes the status of the system.
         *
         * @param args, the status to change.
         */
        public shellStatus(args){

            if(args.length>0){

                var s = "";

                for(var i=0; i<args.length;i++){
                    s += args[i];
                    s += " " ;
                }
                document.getElementById("status").innerHTML = "Status: " + s;
            }
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        /**
         * Sets the current quantum to the argument passed
         * @param args
         */
        public shellQuantum(args){
            if(args[0].length >0){
                if(args[0] >0){
                    _Quantum = args;
                    _StdOut.putText("Current Quantum: " +_Quantum);
                }else {
                    _Quantum = 6;
                    _StdOut.putText("Bitch Please....give me Quantum >"+_Quantum);
                    _Console.advanceLine();
                    _StdOut.putText("Current Quantum: "+_Quantum);
                }
            }else{
                _StdOut.putText("pasarme la perra quamtum");
            }
        }

        /**
         * Shows the PID of active Processes.
         */
        public shellPs(){

            var nobueno:boolean = false;

            for(var i=0; i<_ReadyQueue.getSize();i++){
                var temp : TSOS.Pcb = _ReadyQueue.q[i];
                if(temp.getState() == "Running" || temp.getState() == "Waiting") {
                    nobueno = true;
                    if ((i + 1) == _ReadyQueue.getSize()>0) {
                        _StdOut.putText("Pid: " + temp.getPid());
                    } else {
                        _StdOut.putText("PID: " + temp.getPid() + ", ");
                    }
                }
            }
            if(nobueno == false){
                _StdOut.putText("noo procesos en ejecución !");
            }
        }

        /**
         * Clears Memory Partitions
         */
        public shellClearMem(){
            _MemoryManager.clearMemory();
        }

        /**
         *
         * @param args
         */
        public shellKill(args){


            var killMe:number = args[0];

            if((_CurrentProcess.getPid() == killMe) && (_ReadyQueue.getSize()>0)){
                _CurrentProcess.setState(5);
                _CurrentProcess.setPrintLocation("Memory -> Trash");
                Shell.updateReadyQueue();
                _Kernel.krnInterruptHandler(_KilledRunAll,_CurrentProcess);
                return;
            }

            if((_CurrentProcess.getPid() == killMe) && (_ReadyQueue.isEmpty())){
                _CurrentProcess.setState(5);
                _CurrentProcess.setPrintLocation("Memory -> Trash");
                Shell.updateReadyQueue();
                _Kernel.krnInterruptHandler(_KilledReset,_CurrentProcess);
                return;
            }

            for(var i =0; i<_ResidentQueue.length;i++){
                var process:TSOS.Pcb = _ResidentQueue[i];

                if(process.getPid() == killMe){

                   if(process.getState() == "Killed"){
                       _StdOut.putText("I'm already dead...!");
                       return;
                   }

                   if(process.getLocation() == "Disk"){
                        _FileSystem.deleteFile(_ProgramFile+process.getPid());
                        process.setPrintLocation("Disk -> Trash");
                        process.setState(5);
//                        _ResidentQueue.splice(i,1);
                        Shell.updateReadyQueue();
                        _StdOut.putText("Killed PID: "+process.getPid());
                        break;
                   }
                   if(process.getLocation() == "Memory"){
                        process.setState(5);
                        process.setPrintLocation("Memory -> Trash");
                        Shell.updateReadyQueue();
                        _StdOut.putText("Killed PID: "+process.getPid());
                        break;
                   }
                }
            }
        }

        /**
         * Run a single program
         * @param args
         */
        public shellRun(args){

            if(args.length == 0 || args < 0){
                _StdOut.putText("Load this Bitch again and RUN...!");
            }
            else if(_StepButton){
                _StdOut.putText("Single Step is on!");
            }
            else if(_ResidentQueue[args].getState() == "New") {
                _ResidentQueue[args].setState(3); //only put what's NEW!
                _Kernel.krnInterruptHandler(_RUN,_ResidentQueue[args]);
            }
        }

        /**
         * Invokes the RUNALL case in the Kernel Interrupt Handler
         */
        public shellRunAll(){

            if(_CurrentSchedule == "priority"){
                _CurrentScheduler.sort();
                for(var i=0; i<_ResidentQueue.length;i++){
                    var temp: TSOS.Pcb = _ResidentQueue[i];
                    _ReadyQueue.enqueue(temp);
                }
                _KernelInterruptQueue.enqueue(new Interrupt(_RUNALL,0));
                return;
            }
            for(var i=0; i<_ResidentQueue.length;i++){
                var temp: TSOS.Pcb = _ResidentQueue[i];
                if(temp.getLocation() == "Memory"){
                    temp.setState(3);//set state to "Ready"
                }else{
                    temp.setState(-1);
                }
                _ReadyQueue.enqueue(temp);
            }
            _KernelInterruptQueue.enqueue(new Interrupt(_RUNALL,0));
        }

        /**
         * Formats the FIle System.
         */
        public ShellFormat(){
            _FileSystem.format();
            _StdOut.putText("File System Formatted!");
        }

        /**
         * Creates a file name in the file system
         * @param args
         * @constructor
         */
        public ShellCreate(args){
            if(_FileSystem.isFormatted()){
                var swapFile = args[0].slice(0,4);
                if((_ProgramFile == swapFile)){
                    _StdOut.putText("Cannot create program files, Think of a better name!!");
                    _Console.advanceLine();
                    return;
                }
                _Kernel.krnInterruptHandler(_CREATE, args);
            }else{
                _StdOut.putText("File System not Formatted!");
            }
        }

        /**
         * @param filename
         * @param filecontents
         * @constructor
         */
        public ShellWrite(data){

            if(data.length < 2){
                _StdOut.putText("Did you type anything..?");
                return;
            }

            if(_FileSystem.isFormatted()){
                var filename = data[0];
                var firstArg = data[1];
                var lastArg  = data[data.length-1];
                var firstChar = firstArg.charAt(0);
                var lastChar = lastArg.charAt(lastArg.length-1);
                var firstAscii = firstChar.charCodeAt(0);
                var lastAscii = lastChar.charCodeAt(lastChar.length-1);
                var load:string = "";

                if(data.length == 2){
                    if((firstChar == lastChar) && (firstAscii == 34) && (lastAscii == 34)){
                        load += data[1].slice(1,(data[1].length-1));
                        _FileSystem.writeToFile(filename,load);
                        return;
                    }else{
                        _StdOut.putText("File Contents must be between: \" \"");
                    }
                }

                if(data.length > 2){
                    if((firstChar == lastChar) && (firstAscii == 34) && (lastAscii == 34)){
                        //ready to write...
                        load +=  data[1].slice(1,data[1].length) + " ";
                        load += " ";
                        for(var i = 2; i < data.length;i++){

                            if((i+1) == data.length){
                                load += lastArg.slice(0,data[i].length-1);
                                break;
                            }
                            load += data[i];
                            load += " ";
                        }
                        _FileSystem.writeToFile(filename,load);
                    }else{
                        _StdOut.putText("File Contents must be between: \" \"");
                    }
                }
            }else{
                _StdOut.putText("File System not Formatted!");
            }

        }

        /**
         * Reads the contents of the filename
         * @param filename
         * @constructor
         */
        public ShellRead(filename){
            if(_FileSystem.isFormatted()){
                _Kernel.krnInterruptHandler(_READ, filename);
            }else{
                _StdOut.putText("File System not Formatted!");
            }
        }

        /**
         * List of the active files.
         * @constructor
         */
        public ShellLs(){
            if(_FileSystem.isFormatted()){
                _Kernel.krnInterruptHandler(_LS, 0);
            }else{
                _StdOut.putText("File System not Formatted!");
            }
        }

        public ShellDelete(filename:string){
            if(_FileSystem.isFormatted()){
                _Kernel.krnInterruptHandler(_DELETE, filename);
            }else{
                _StdOut.putText("File System not Formatted!");
            }
        }

        /**
         * Sets the current schedule
         * @param schedule
         * @constructor
         */
        public ShellSetSchedule(schedule:string){

            if(schedule == "rr" || schedule == "fcfs" || schedule == "priority"){
                _CurrentSchedule = schedule;
                _StdOut.putText("Current Schedule: "+_CurrentSchedule);
            }else{
                _StdOut.putText("Invalid Schedule type!");
            }
            _CurrentScheduler.updateSchedule(_CurrentSchedule);
        }

        /**
         * Gets the current schedule
         * @constructor
         */
        public ShellGetSchedule(){
            _StdOut.putText("Current Schedule: "+_CurrentSchedule);
        }
    }
}