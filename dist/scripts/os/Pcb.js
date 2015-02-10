/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    (function (Process) {
        Process[Process["New"] = 0] = "New";
        Process[Process["Running"] = 1] = "Running";
        Process[Process["Terminated"] = 2] = "Terminated";
        Process[Process["Killed"] = 3] = "Killed";
        Process[Process["Waiting"] = 4] = "Waiting";
    })(TSOS.Process || (TSOS.Process = {}));
    var Process = TSOS.Process;

    var Pcb = (function () {
        function Pcb(b, l, p) {
            this.pid = Pcb.PID;
            this.pc = 0;
            this.acc = 0;
            this.ir = "";
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.base = 0;
            this.limit = 0;
            this.state = "?";
            this.length = 0;
            this.block = 0;
            this.priority = 0;
            this.location = "";
            this.printLocation = "";
            this.timeArrived = 0;
            this.timeFinished = 0;
            Pcb.PID++;
            this.pid = Pcb.PID; //Increment PID all the time!
            this.base = b;
            this.pc = 0;
            this.limit = l;
            if (this.base == -1) {
                this.block = -1;
            } else {
                this.block = (this.base / _BlockSize);
            }
            this.priority = p;
        }
        Pcb.prototype.getPid = function () {
            return this.pid;
        };

        Pcb.prototype.setLength = function (length) {
            this.length = (this.base + length);
        };

        Pcb.prototype.setState = function (s) {
            switch (s) {
                case 1:
                    this.state = "Running";
                    break;
                case 2:
                    this.state = "Waiting";
                    break;
                case 3:
                    this.state = "Ready";
                    break;
                case 4:
                    this.state = "Terminated";
                    break;
                case 5:
                    this.state = "Killed";
                    break;
                default:
                    this.state = "New";
            }
        };

        Pcb.prototype.setLocation = function (location) {
            this.location = location;
        };

        Pcb.prototype.getLocation = function () {
            return this.location;
        };

        Pcb.prototype.setPrintLocation = function (location) {
            this.printLocation = location;
        };

        Pcb.prototype.getPrintLocation = function () {
            return this.printLocation;
        };

        Pcb.prototype.getPriority = function () {
            return this.priority;
        };

        Pcb.prototype.getState = function () {
            return this.state;
        };

        Pcb.prototype.getLimit = function () {
            return this.limit;
        };

        Pcb.prototype.setLimit = function (limit) {
            this.limit = limit;
        };

        Pcb.prototype.setBase = function (base) {
            this.base = base;
        };

        Pcb.prototype.setBlock = function (block) {
            this.block = block;
        };

        Pcb.prototype.getBase = function () {
            return this.base;
        };

        Pcb.prototype.getLength = function () {
            return this.length;
        };

        Pcb.prototype.getX = function () {
            return this.x;
        };

        Pcb.prototype.getY = function () {
            return this.y;
        };

        Pcb.prototype.getZ = function () {
            return this.z;
        };

        Pcb.prototype.getIR = function () {
            return this.ir;
        };

        Pcb.prototype.getAcc = function () {
            return this.acc;
        };

        Pcb.prototype.getPc = function () {
            return this.pc;
        };

        Pcb.prototype.setPc = function (pc) {
            this.pc = pc;
        };

        Pcb.prototype.setX = function (x) {
            this.x = x;
        };

        Pcb.prototype.setY = function (y) {
            this.y = y;
        };

        Pcb.prototype.setZ = function (z) {
            this.z = z;
        };

        Pcb.prototype.setAcc = function (acc) {
            this.acc = acc;
        };

        Pcb.prototype.setIr = function (ir) {
            this.ir = ir;
        };

        Pcb.prototype.setTimeArrived = function (time) {
            this.timeArrived = time;
        };

        Pcb.prototype.setTimeFinished = function (time) {
            this.timeFinished = time;
        };

        Pcb.prototype.getBlock = function () {
            return this.block;
        };

        Pcb.prototype.getTimeArrived = function () {
            return this.timeArrived;
        };

        Pcb.prototype.getTimeFinished = function () {
            return this.timeFinished;
        };

        Pcb.prototype.setPriority = function (p) {
            this.priority = p;
        };

        Pcb.displayTimeMonitor = function () {
            var table = "<table>";

            table += "<th>PID</th>";
            table += "<th>Arrived</th>";
            table += "<th>Terminated</th>";
            table += "<th>Turnaround</th>";

            for (var i = _TerminatedQueue.length - 1; i >= 0; i--) {
                var p = _TerminatedQueue[i];
                table += "<tr>";
                table += "<td>" + p.getPid() + "</td>";
                table += "<td>" + p.getTimeArrived() + "</td>";
                table += "<td>" + p.getTimeFinished() + "</td>";
                table += "<td>" + parseInt(p.getTimeFinished() - p.getTimeArrived()) + "</td>";
                table += "</tr>";
            }

            table += "</table>";
            document.getElementById("monitor").innerHTML = table;
        };
        Pcb.PID = -1;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
