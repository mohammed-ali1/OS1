/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.createTable();
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                if (i % _BlockSize == 0) {
                    Memory.segment++;
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }

                for (var j = i; j <= i + 7; j++) {
                    _MainMemory[j] = "00";
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            document.getElementById("table").innerHTML = table;
        };

        /**
        * Reads the Memory at the given index
        * @param index
        * @returns {string}
        */
        Memory.prototype.read = function (index) {
            return _MainMemory[index];
        };

        /**
        * Store in memory str, at address index
        * @param index
        * @param str
        */
        Memory.prototype.store = function (index, str) {
            _MainMemory[index] = str;
        };

        /**
        * Loads the program into the Main Memory
        */
        Memory.prototype.loadProgram = function (base, str) {
            var x = str.replace(/^\s+|\s+$/g, '');
            x = str.trim();
            var a = 0, b = 2;
            var s;

            for (var i = base; i < base + (x.length / 2); i++) {
                s = x.substring(a, b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }
            for (var j = base; j < (base + _BlockSize); j++) {
                s = _MainMemory[j];
                if (s.length <= 1) {
                    _MainMemory[j] = "00";
                }
            }
            this.updateMemory();
        };

        /**
        * Updates the Memory.
        */
        Memory.prototype.updateMemory = function () {
            Memory.segment = -1;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                if (i % _BlockSize == 0) {
                    Memory.segment++;
                    table += "<tr ><td style='font-size: 10px; font-weight: bold;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 10px; font-weight: bold;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for (var j = i; j <= i + 7; j++) {
                    if (_MainMemory[j] == "") {
                        _MainMemory[j] = "00";
                    }
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };

        /**
        * Clears the Memory
        */
        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < _MainMemorySize; i++) {
                _MainMemory[i] = "00";
            }
            this.updateMemory();
        };

        Memory.prototype.clearBlock = function (base) {
            for (var i = base; i < (base + _BlockSize); i++) {
                _MainMemory[i] = "00";
            }
            this.updateMemory();
        };

        /**
        * Returns the size of the Memory.
        * @returns {number}
        */
        Memory.prototype.size = function () {
            return _MainMemorySize;
        };

        Memory.prototype.copyBlock = function (base) {
            var data = "";
            var current;
            for (var i = base; i < (base + _BlockSize); i++) {
                current = _MainMemory[i];
                if (current.length == 1) {
                    data += "0" + current;
                } else {
                    data += current;
                }
            }
            this.updateMemory();
            return data;
        };
        Memory.segment = -1;
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
