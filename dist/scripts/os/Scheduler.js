/**
* Created by anwar on 11/2/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(schedule) {
            _CurrentSchedule = schedule;
            this.updateSchedule(_CurrentSchedule);
        }
        /**
        * Handles Round Robin Scheduling
        */
        Scheduler.prototype.rr = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue(); // grab the next process

                if ((_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed")) {
                    this.rr();
                }

                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                if ((_CurrentProcess.getLocation() == "Memory")) {
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                    return;
                }
                if ((_CurrentProcess.getLocation() == "Disk")) {
                    _Kernel.contextSwitchDisk(true, false, false);
                    return;
                }
            } else if ((_CurrentProcess.getState() != "Terminated" && _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                return;
            }
        };

        Scheduler.prototype.fcfs = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue();

                if ((_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed")) {
                    this.priority();
                }

                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                if ((_CurrentProcess.getLocation() == "Memory")) {
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                    return;
                }
                if ((_CurrentProcess.getLocation() == "Disk")) {
                    _Kernel.contextSwitchDisk(false, true, false);
                    return;
                }
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                //               _ResidentQueue.splice(0, _ResidentQueue.length); // clear resident Queue as well!
                TSOS.Shell.updateReadyQueue();
            }
        };

        Scheduler.prototype.priority = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue();

                if ((_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed")) {
                    this.priority();
                }

                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                if ((_CurrentProcess.getLocation() == "Memory")) {
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nContext Switch to Pid: " + _CurrentProcess.getPid() + "\n");
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                    return;
                }
                if ((_CurrentProcess.getLocation() == "Disk")) {
                    _Kernel.contextSwitchDisk(false, false, true);
                    return;
                }
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                return;
            }
        };

        /**
        *
        * @param schedule
        */
        Scheduler.prototype.updateSchedule = function (schedule) {
            if (schedule == "rr") {
                document.getElementById("currentScheduler").innerHTML = "Current Schedule: Round Robin";
            } else if (schedule == "fcfs") {
                document.getElementById("currentScheduler").innerHTML = "Current Schedule: First Come First Served";
            } else {
                document.getElementById("currentScheduler").innerHTML = "Current Schedule: Priority";
            }
        };

        /**
        *
        */
        Scheduler.prototype.sort = function () {
            for (var i = 0; i < _ResidentQueue.length; i++) {
                for (var j = 1; j < ((_ResidentQueue.length) - i); j++) {
                    var first = _ResidentQueue[j - 1].getPriority();
                    var second = _ResidentQueue[j].getPriority();
                    if (first > second) {
                        var temp = _ResidentQueue[j - 1];
                        _ResidentQueue[j - 1] = _ResidentQueue[j];
                        _ResidentQueue[j] = temp;

                        var temp1 = _TerminatedQueue[j - 1];
                        _TerminatedQueue[j - 1] = _TerminatedQueue[j];
                        _TerminatedQueue[j] = temp1;
                    }
                }
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
