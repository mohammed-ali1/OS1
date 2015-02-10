/**
* Created by anwar on 12/10/14.
*/
var TSOS;
(function (TSOS) {
    var Activity = (function () {
        function Activity() {
            this.killed = 0;
            this.terminated = 0;
            this.waiting = 0;
            this.running = 0;
            this.inMemory = 0;
            this.inDisk = 0;
            this.inTrash = 0;
        }
        Activity.prototype.killed = function () {
            this.killed++;
        };
        Activity.prototype.terminated = function () {
            this.terminated++;
        };
        Activity.prototype.waiting = function () {
            this.waiting++;
        };
        Activity.prototype.running = function () {
            this.running++;
        };
        Activity.prototype.inMemory = function () {
            this.inMemory++;
        };
        Activity.prototype.inDisk = function () {
            this.inDisk++;
        };
        Activity.prototype.inTrash = function () {
            this.inTrash++;
        };

        Activity.prototype.getKilled = function () {
            return this.killed;
        };
        Activity.prototype.getTerminated = function () {
            return this.terminated;
        };
        Activity.prototype.getWaiting = function () {
            return this.waiting;
        };
        Activity.prototype.getRunning = function () {
            return this.running;
        };
        Activity.prototype.getInMemory = function () {
            return this.inMemory;
        };
        Activity.prototype.getInDisk = function () {
            return this.inDisk;
        };
        Activity.prototype.getInTrash = function () {
            return this.inTrash;
        };

        Activity.prototype.updateActivity = function () {
            var table = "<table>";

            for (var i = 0; i < _TerminatedQueue.length; i++) {
                var p = _TerminatedQueue[i];
                table += "<tr>";
                table += "<td>" + this.getKilled() + "</td>";
                table += "<td>" + this.terminated() + "</td>";
                table += "<td>" + this.inMemory() + "</td>";
                table += "<td>" + this.inDisk() + "</td>";
                table += "<td>" + this.running() + "</td>";
                table += "<td>" + this.waiting() + "</td>";
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("displayReady").innerHTML = table;
        };
        return Activity;
    })();
    TSOS.Activity = Activity;
})(TSOS || (TSOS = {}));
