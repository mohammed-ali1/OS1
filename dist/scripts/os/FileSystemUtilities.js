/**
* Created by anwar on 11/27/14.
*/
var TSOS;
(function (TSOS) {
    var FSU = (function () {
        /**
        * Utility class for the File System.
        * Some useful methods which can be useful
        * to write the actual file system.
        */
        function FSU() {
        }
        /**
        * Converts String to its hex value
        * @param str
        * @returns {string}
        */
        FSU.prototype.stringToHex = function (str) {
            var s = "";
            for (var i = 0; i < str.length; i++) {
                s += str.charCodeAt(i).toString(16);
            }
            return s;
        };

        /**
        * Converts hex value to String
        * @param str
        * @returns {string}
        */
        FSU.prototype.hexToString = function (str) {
            var p;
            var q;
            var hexString = "";
            for (var i = 0; i < str.length; i += 2) {
                p = str.charAt(i);
                q = str.charAt(i + 1);
                hexString += String.fromCharCode(parseInt((p + q), 16)).toString();
            }
            return hexString;
        };

        /**
        * Adds Padding to the string up to the
        * length parameter.
        * @param str
        * @param length
        * @returns {string}
        */
        FSU.prototype.padding = function (str, length) {
            var temp = "";
            if (str.length > length) {
                return str;
            }

            var i = str.length;
            while (i < length) {
                temp += "0";
                i++;
            }
            str += temp;
            return str;
        };

        /**
        * Formats the data to all zeroes "0".
        * @param size
        * @returns {string}
        */
        FSU.prototype.formatData = function (size) {
            var data = "";
            for (var i = 0; i < size; i++) {
                data += "0";
            }
            return data;
        };

        /**
        * Creates the MBR and adds it to the
        * local storage.
        * @param sessionStorage
        * @param size
        */
        FSU.prototype.createMBR = function (sessionStorage, size) {
            var data = this.stringToHex(("MBR"));
            var pad = this.padding("1###" + data, size);
            var key = this.makeKey(0, 0, 0);
            sessionStorage.setItem(key, pad);
        };

        /**
        * Creates a local file system.
        * Use this method when format is called.
        */
        FSU.prototype.format = function (trackSize, sectorSize, blockSize, dataSize, sessionStorage) {
            var storage = this.formatData(dataSize);
            var dir = 0;
            var data = 0;

            for (var track = 0; track < trackSize; track++) {
                for (var sector = 0; sector < sectorSize; sector++) {
                    for (var block = 0; block < blockSize; block++) {
                        var key = this.makeKey(track, sector, block);
                        sessionStorage.setItem(key, storage);
                    }
                }
            }
        };

        /**
        * Updates the FilSystem
        * @param trackSize
        * @param sectorSize
        * @param blockSize
        * @param sessionStorage
        */
        FSU.prototype.update = function (trackSize, sectorSize, blockSize, sessionStorage) {
            var table = "<table>";
            table += "<th>TSB</th>";
            table += "<th>META</th>";
            table += "<th>DATA</th>";

            for (var t = 0; t < trackSize; t++) {
                for (var s = 0; s < sectorSize; s++) {
                    for (var b = 0; b < blockSize; b++) {
                        var key = this.makeKey(t, s, b);
                        var metadata = sessionStorage.getItem(key);
                        var meta = metadata.slice(0, 4);
                        var data = metadata.slice(4, metadata.length);

                        //add some colors for readability.
                        if (key.charAt(0) == "0") {
                            if (meta.charAt(0) == "1") {
                                table += "<tr><td>" + t + s + b + " </td>";
                                table += "<td style='color: red; background-color: #ffffff;'>" + meta + " " + "</td>";
                                table += "<td>" + data + "</td></tr>";
                            } else {
                                table += "<tr><td>" + t + s + b + " </td>";
                                table += "<td style='color: #028064; background-color: #ffffff;'>" + meta + " " + "</td>";
                                table += "<td>" + data + "</td></tr>";
                            }
                        } else {
                            if (meta.charAt(0) == "1") {
                                table += "<tr><td>" + t + s + b + " </td>";
                                table += "<td style='color: red; background-color: #ffffff;'>" + meta + " " + "</td>";
                                table += "<td>" + data + "</td></tr>";
                            } else {
                                table += "<tr><td>" + t + s + b + " </td>";
                                table += "<td style='color: #028064; background-color: #ffffff;'>" + meta + " " + "</td>";
                                table += "<td>" + data + "</td></tr>";
                            }
                        }
                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
            document.getElementById("fileSystemDiv").style.visibility = "visible";
        };

        /**
        * Makes a new Key in the TSB
        * @param t
        * @param s
        * @param b
        * @returns {string}
        */
        FSU.prototype.makeKey = function (t, s, b) {
            return String(t) + String(s) + String(b);
        };

        FSU.prototype.getDataIndex = function (trackSize, sectorSize, blockSize) {
            for (var t = 1; t < trackSize; t++) {
                for (var s = 0; s < sectorSize; s++) {
                    for (var b = 0; b < blockSize; b++) {
                        var key = this.makeKey(t, s, b);
                        var data = sessionStorage.getItem(key);
                        var meta = data.slice(0, 1);
                        if (meta == "0") {
                            return key;
                        }
                    }
                }
            }
            return "-1";
        };
        return FSU;
    })();
    TSOS.FSU = FSU;
})(TSOS || (TSOS = {}));
