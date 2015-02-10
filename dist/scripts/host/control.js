///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
/* ------------
Control.ts
Requires globals.ts.
Routines for the hardware simulation, NOT for our client OS itself.
These are static because we are never going to instantiate them, because they represent the hardware.
In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
is the "bare metal" (so to speak) for which we write code that hosts our client OS.
But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
in both the host and client environments.
This (and other host/simulation scripts) is the only place that we should see "web" code, such as
DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // Get a global reference to the canvas.  TODO: Move this stuff into a Display Device Driver, maybe?
            _Canvas = document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };

        Control.hostLog = function (msg, source) {
            if (typeof source === "undefined") { source = "?"; }
            _FancyColor++;

            // Note the OS CLOCK.
            var clock = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();

            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";

            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            //            IF YOU LIKE COLORS UN-COMMENT THIS!
            //            if(_FancyColor % 2 == 0){
            //                document.getElementById("taHostLog").style.color = "#FFD801";
            //                document.getElementById("taHostLog").style.border = "3px solid #E66C2C";
            //            }else{
            //                document.getElementById("taHostLog").style.color = "#E66C2C";
            //                document.getElementById("taHostLog").style.border = "3px solid #FFD801";
            //            }
            //            taLog.style.color = "#" + Math.floor(Math.random()*16777215).toString(16); //YOU LIKE COLORS?
            // Optionally update a log database or some streaming service.
            //            _CPU.init(); // THIS ONE GOT ME IN TROUBLE....CPU WAS GOING FOR ONLY 1 CYCLE!
        };

        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu();
            _CPU.reset();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);

            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap();

            //Display System Status...
            document.getElementById("status").innerHTML = "Running...";
            document.getElementById("status").style.color = "#339933";

            //Display clock here!
            _Console.renderDate();
        };

        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };

        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };

        /**
        * Handles the step button
        * @param btn, the button to handle.
        */
        Control.hostStepButton_click = function (btn) {
            document.getElementById("stepButton").style.visibility = "hidden";
            document.getElementById("nextButton").style.visibility = "visible";
            document.getElementById("stopButton").style.visibility = "visible";
            _StepButton = true;
        };

        /**
        * Handles the next button as an interrupt
        * @param btn, the button to handle.
        */
        Control.hostNextButton_click = function (btn) {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_NextButton, 0));
        };

        /**
        * Handles the stop button
        * @param btn, the button to handle.
        */
        Control.hostStopButton_click = function (btn) {
            _StepButton = false;
            document.getElementById("stepButton").style.visibility = "visible";
            document.getElementById("nextButton").style.visibility = "hidden";
            document.getElementById("stopButton").style.visibility = "hidden";
        };

        Control.prototype.handleScheduling = function () {
            alert("submitting form");
            _CurrentSchedule = document.getElementById("schedulingForm").submit();
            alert("Form now: " + _CurrentSchedule);
        };
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
