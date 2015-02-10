var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created by anwar on 11/26/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function (_super) {
        __extends(FileSystem, _super);
        function FileSystem() {
            _super.call(this, this.launch, this.voidMethod);
        }
        FileSystem.prototype.launch = function () {
            this.status = "loaded";
            this.trackSize = 4;
            this.sectorSize = 8;
            this.blockSize = 8;
            this.metaDataSize = 64;
            this.dataSize = 60;
            this.support = 0;
            this.formatted = false;
            this.fsu = new TSOS.FSU(); //file system utilities
            this.zeroData = this.fsu.formatData(this.metaDataSize);
        };

        FileSystem.prototype.voidMethod = function () {
            //what to do in here.....?
        };

        /**
        * Formats the disk drive.
        */
        FileSystem.prototype.format = function () {
            this.hasStorage();

            //has support for local storage?
            if (this.support == 1) {
                this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.metaDataSize, sessionStorage);
                this.createMBR();
                this.update();
                this.formatted = true;
            }
        };

        /**
        * Creates the Master Boot Record
        */
        FileSystem.prototype.createMBR = function () {
            this.fsu.createMBR(sessionStorage, this.metaDataSize);
        };

        /**
        * Updates the File System Table
        */
        FileSystem.prototype.update = function () {
            this.fsu.update(this.trackSize, this.sectorSize, this.blockSize, sessionStorage);
        };

        /**
        * Deletes the file requested.
        * @param str
        */
        FileSystem.prototype.deleteFile = function (str) {
            var hexData = this.fsu.stringToHex(str.toString());
            var fileData = this.fsu.padding(hexData, (this.dataSize));
            var dataIndex = this.getFileContents(fileData);
            var zero = this.fsu.formatData(this.metaDataSize);

            if (dataIndex == "-1") {
                _StdOut.putText("Cannot find the file: " + str);
            } else {
                if (dataIndex != "###") {
                    this.startDeleting(dataIndex, zero);
                }
            }
            this.update();
        };

        FileSystem.prototype.startDeleting = function (index, zero) {
            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        var key = this.fsu.makeKey(t, s, b);
                        var data = sessionStorage.getItem(key);
                        var nextKey = data.slice(1, 4);
                        if (key != "000") {
                            if (nextKey == "###") {
                                sessionStorage.setItem(key, zero);
                                this.update();
                                return;
                            } else {
                                sessionStorage.setItem(key, zero);
                                this.update();
                            }
                        }
                        index = nextKey;
                    }
                }
            }
        };

        /**
        * Read Active files from the Disk
        * @param file
        */
        FileSystem.prototype.read = function (file) {
            var filename = this.fsu.stringToHex(file.toString());
            var pad = this.fsu.padding(filename, this.dataSize);

            //get file index
            var key = this.fetchDuplicate(pad);

            //if not found...then return
            if (key == "-1") {
                _StdOut.putText("Cannot find the file: " + file);
                return;
            }

            var data = sessionStorage.getItem(key);
            var meta = data.slice(1, 4);

            if (meta == "###") {
                var a = sessionStorage.getItem(meta);
                _StdOut.putText(this.fsu.hexToString(a.slice(4, a.length).toString()));
            } else {
                this.startPrinting(meta);
            }
        };

        /**
        * Write to the file
        * @param file
        * @param contents
        * @param pad
        */
        FileSystem.prototype.writeToFile = function (file, contents) {
            //get the address of the data
            var success = false;
            var hex = this.fsu.stringToHex(file.toString());
            var hexFile = this.fsu.padding(hex, this.dataSize);
            var key = this.fetchDuplicate(hexFile);
            if (key == "-1") {
                _StdOut.putText("Cannot find the file: " + file);
                return;
            }

            var data = sessionStorage.getItem(key);
            var dataIndex = data.slice(1, 4);
            var contentsHex = this.fsu.stringToHex(contents.toString());

            //what if the contents to write is > 60 bytes
            if (contentsHex.length > (this.dataSize)) {
                var hasSpace = this.handleWrite(dataIndex, contentsHex, (this.dataSize));
                if (hasSpace) {
                    success = true;
                } else {
                    success = false;
                    return success;
                }
            } else {
                var padHex = this.fsu.padding(contentsHex, this.dataSize);
                sessionStorage.setItem(dataIndex, "1###" + padHex);
                this.update();
                success = true;
            }
            this.update();

            var swapFile = file.slice(0, 4);

            //print only if its not a swap-file
            if (success && (_ProgramFile != swapFile)) {
                if (success) {
                    _StdOut.putText("Successfully wrote to: " + file);
                    return success;
                } else {
                    _StdOut.putText("Cannot write to file: " + file + ", Please format and try again!");
                    return success;
                }
            }
        };

        /**
        * ls command
        * Use local map to to read all the active files.
        */
        FileSystem.prototype.fileDirectory = function () {
            var t = 0;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);
                    var data = sessionStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    var hexData = data.slice(4, data.length);
                    var stringData = this.fsu.hexToString(hexData);
                    if (meta == "1") {
                        _StdOut.putText(key + ": " + stringData.toString());
                        _Console.advanceLine();
                    }
                }
            }
        };

        /**
        * Able to create file...
        * Need to do serious error checking!!
        */
        FileSystem.prototype.createFile = function (filename) {
            var created = false;

            //convert filename to hex
            var data = this.fsu.stringToHex(filename.toString());

            //add padding to the filename
            var hexData = this.fsu.padding(data, this.dataSize);

            //we don't want file-names of size > 60 Bytes!
            if ((hexData.length) > this.dataSize) {
                _StdOut.putText("Filename must be <= " + (this.dataSize / 2) + " characters!");
                return created;
            }

            //Look for a duplicate-filename...first!
            var dirIndex = this.fetchDuplicateFilename(hexData);

            if (dirIndex == "-1") {
                _StdOut.putText("Filename " + filename + " already exists...Or not enough space!");
                return created;
            }

            //Get dataIndex...at this point data
            var dataIndex = this.fsu.getDataIndex(this.trackSize, this.sectorSize, this.blockSize);

            if (dataIndex != "-1") {
                //store in dir-Index
                sessionStorage.setItem(dirIndex, ("1" + dataIndex + hexData)); //need to add actualData
                this.update();

                //store "0" in data address
                var formatData = this.fsu.formatData((this.dataSize));
                sessionStorage.setItem(dataIndex, "1###" + formatData);
                this.update();

                //mark success
                created = true;

                //update file system
                this.update();
            } else {
                //no more storage space
                _StdOut.putText("No Space available to store file-contents!");
                return created;
            }

            var swapFile = filename.slice(0, 4);

            //if we are creating a swap-file...we don't want to print.
            if (created && (_ProgramFile == swapFile)) {
                return created;
            }

            //print success or failure
            if (created) {
                _StdOut.putText("Successfully created file: " + filename);
                _Console.advanceLine();
                return created;
            } else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
                _Console.advanceLine();
                return created;
            }
        };

        FileSystem.prototype.isFormatted = function () {
            return this.formatted;
        };

        /**
        * Looks for available key in DIR Block
        * @returns {string}
        */
        FileSystem.prototype.fetchDuplicateFilename = function (filename) {
            var t = 0;
            var key;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = sessionStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    var dataData = data.slice(4, data.length);
                    if (meta == "1" && (dataData == filename)) {
                        return "-1";
                    } else if (meta == "0") {
                        return key;
                    }
                }
            }
            return "-1";
        };

        /**
        * Looks for a duplicate filename, if any
        * @param filename
        * @returns {string}
        */
        FileSystem.prototype.fetchDuplicate = function (filename) {
            var t = 0;
            var key;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = sessionStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    var hexData = data.slice(4, this.metaDataSize);
                    if ((filename == hexData) && (meta == "1")) {
                        return key;
                    }
                }
            }
            return "-1";
        };

        /**
        * Looks for filename
        * @param filename
        * @returns {string}
        */
        FileSystem.prototype.getFileContents = function (filename) {
            var t = 0;
            var key;
            var zero = this.fsu.formatData(this.metaDataSize);
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = sessionStorage.getItem(key);
                    var inUse = data.slice(0, 1);
                    var meta = data.slice(1, 4);
                    var hexData = data.slice(4, data.length);
                    if ((filename == hexData) && (inUse == "1")) {
                        sessionStorage.setItem(key, zero); //delete the contents
                        this.update();
                        return meta;
                    }
                }
            }
            return "-1";
        };

        FileSystem.prototype.hasStorage = function () {
            if ('localStorage' in window && window['localStorage'] !== null) {
                this.support = 1;
            } else {
                this.support = 0;
            }
        };

        FileSystem.prototype.getAvailableAddresses = function (first, limit) {
            var array = new Array();
            array.push(first);
            var stepOut = false;

            for (var t = 1; t < this.trackSize; t++) {
                for (var s = 0; s < this.sectorSize; s++) {
                    for (var b = 0; b < this.blockSize; b++) {
                        var key = this.fsu.makeKey(t, s, b);
                        var data = sessionStorage.getItem(key);
                        var meta = data.slice(0, 1);

                        if ((key == "377") && (array.length < (limit))) {
                            _Kernel.krnInterruptHandler(_BSOD, "Not enough space for you!");
                            return;
                        }
                        if (meta == "0") {
                            array.push(key);
                        }
                        if (array.length == (limit)) {
                            stepOut = true;
                            break;
                        }
                    }
                    if (stepOut) {
                        break;
                    }
                }
                if (stepOut) {
                    break;
                }
            }
            return array;
        };

        /**
        * Handles writing to the disk of size > 60 bytes.
        * @param dataIndex
        * @param fileContents
        * @param size
        */
        FileSystem.prototype.handleWrite = function (dataIndex, fileContents, size) {
            var ceiling = Math.ceil(fileContents.length / (size));
            var array = new Array();
            var newKey = this.makeFreshKey(dataIndex);

            //get more keys starting from newKey
            array = this.getAvailableAddresses(newKey, (ceiling - 1));

            var start = 0;
            var end = size;
            var chunk = "";

            for (var a = 0; a < array.length; a++) {
                chunk = fileContents.slice(start, end);
                var key = this.makeFreshKey(array[a]);

                if (a + 1 < array.length) {
                    var nextKey = this.makeFreshKey(array[a + 1]);
                    sessionStorage.setItem(key, "1" + nextKey + chunk);
                    this.update();
                } else {
                    var pad = this.fsu.padding(chunk, size);
                    sessionStorage.setItem(key, "1###" + pad);
                    this.update();
                    break;
                }
                if (end == fileContents.length) {
                    break;
                }
                if ((end + size) > (fileContents.length)) {
                    start = end;
                    end = (fileContents.length);
                } else {
                    start = end;
                    end = (end + size);
                }
            }
        };

        FileSystem.prototype.makeFreshKey = function (key) {
            var t = key.charAt(0);
            var s = key.charAt(1);
            var b = key.charAt(2);
            return this.fsu.makeKey(t, s, b);
        };

        //load this process into the disk
        FileSystem.prototype.rollOut = function (filename, contents) {
            if ((contents.length / 2) > (_BlockSize)) {
                _StdOut.putText("Process is bigger than memory block!");
            } else {
                var created;
                created = this.createFile(filename);
                if (created) {
                    this.writeToFile(filename, contents);
                    return created;
                } else {
                    return created;
                }
            }
        };

        //go to disk, remove a process, store this process
        FileSystem.prototype.rollIn = function (currentProcess, nextProcess) {
            var data;
            var oldContents;

            //search for a filename
            var filename = _ProgramFile + currentProcess.getPid();
            var fileHex = this.fsu.stringToHex(filename.toString());
            var padFile = this.fsu.padding(fileHex, this.dataSize);
            var dataIndex = this.getFileContents(padFile);
            data = this.grabAllHex(dataIndex); //read current process contents

            currentProcess.setBase(nextProcess.getBase());
            currentProcess.setLimit(nextProcess.getLimit());
            currentProcess.setBlock(nextProcess.getBlock());
            currentProcess.setLocation("Memory");
            currentProcess.setPrintLocation("Memory");
            currentProcess.setState(1); //set state to running
            TSOS.Shell.updateReadyQueue();

            if (nextProcess.getState() != "Terminated" && nextProcess.getState() != "Killed") {
                filename = _ProgramFile + nextProcess.getPid();
                oldContents = _MemoryManager.copyBlock(nextProcess.getBase());
                if (data.length < this.dataSize) {
                    _MemoryManager.clearBlock(nextProcess.getBase()); //clear the block
                }
                nextProcess.setLocation("Disk");
                nextProcess.setPrintLocation("Memory -> Disk");
                nextProcess.setState(2); //waiting
                nextProcess.setBase(-1);
                nextProcess.setLimit(-1);
                nextProcess.setBlock(-1);
                this.createFile(filename);
                this.writeToFile(filename, oldContents);
                TSOS.Shell.updateReadyQueue();
            } else {
                //even though it won't be in the disk
                //we need to set the location to disk here
                //because when we kill or swap...we can still swap
                //in order
                nextProcess.setLocation("Disk");
                nextProcess.setPrintLocation("Memory -> Trash");
                TSOS.Shell.updateReadyQueue();
            }

            //load back in to memory and continue...
            _MemoryManager.load(currentProcess.getBase(), data.toString());
            _MemoryManager.update();
            this.update();
        };

        /**
        * This method just swaps from the disk and loads
        * into the memory....fcfs
        * @param processOnDisk
        * @param base
        * @returns {string}
        */
        FileSystem.prototype.swap = function (processOnDisk, base) {
            var data;
            var zeroData = this.fsu.formatData(this.metaDataSize);

            //search for a filename
            var filename = "swap" + processOnDisk.getPid();
            var fileHex = this.fsu.stringToHex(filename.toString());
            var padFile = this.fsu.padding(fileHex, this.dataSize);
            var dataIndex = this.getFileContents(padFile);

            //get the data of the file
            //grab everything in hex!!!!
            data = this.grabAllHex(dataIndex);
            sessionStorage.setItem(dataIndex, zeroData);
            this.update();

            processOnDisk.setBase(base);
            processOnDisk.setLimit((base + _BlockSize));
            processOnDisk.setBlock((base / _BlockSize));
            TSOS.Shell.updateReadyQueue();

            //load current process into the mem
            _MemoryManager.load(processOnDisk.getBase(), data.toString());
            this.update();
            _MemoryManager.update();
        };

        /**
        * returns all the context starting
        * from the index
        * @param index
        */
        FileSystem.prototype.grabAllHex = function (index) {
            var value = "";
            var key;
            var data;
            var nextKey;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var stepOut = false;
            var dataData;
            var changeHex;

            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        key = this.makeFreshKey(index);
                        data = sessionStorage.getItem(key);
                        nextKey = data.slice(1, 4);
                        dataData = data.slice(4, data.length);
                        if (nextKey == "###") {
                            changeHex = this.fsu.hexToString(dataData);
                            value += changeHex;
                            sessionStorage.setItem(key, zeroData); //replace with zeros
                            this.update();
                            stepOut = true;
                            break;
                        } else {
                            changeHex = this.fsu.hexToString(dataData);
                            value += changeHex;
                            sessionStorage.setItem(key, zeroData); //replace with zeros
                            this.update();
                        }
                        index = nextKey;
                    }
                    if (stepOut) {
                        break;
                    }
                }
                if (stepOut) {
                    break;
                }
            }
            if (stepOut) {
                return value;
            }
        };

        /**
        * Reads all the contents from
        * the start address
        * @param index
        * @returns {string}
        */
        FileSystem.prototype.startReading = function (index) {
            var oldData = "";
            var key;
            var data;
            var nextMeta;
            var zeroData = this.fsu.formatData(this.metaDataSize);

            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        key = this.fsu.makeKey(t, s, b);
                        data = sessionStorage.getItem(key);
                        nextMeta = data.slice(1, 4);
                        if (nextMeta == "###") {
                            oldData += data.slice(4, data.length);
                            sessionStorage.setItem(key, zeroData); //replace with zeros
                            this.update();
                            return oldData;
                        } else {
                            oldData += data.slice(4, data.length);
                            sessionStorage.setItem(key, zeroData); //replace with zeros
                            this.update();
                        }
                        index = nextMeta;
                    }
                }
            }
        };

        FileSystem.prototype.startPrinting = function (index) {
            var oldData;
            var len = "";
            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        var key = this.fsu.makeKey(t, s, b);
                        var data = sessionStorage.getItem(key);
                        var nextKey = data.slice(1, 4);
                        if (nextKey == "###") {
                            oldData = data.slice(4, data.length);
                            len += oldData;
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                            _Console.advanceLine();
                            return;
                        } else {
                            oldData = data.slice(4, data.length);
                            len += oldData;
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                        }
                        index = nextKey;
                    }
                }
            }
        };
        return FileSystem;
    })(TSOS.DeviceDriver);
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
