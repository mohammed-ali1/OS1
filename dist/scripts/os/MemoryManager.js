/**
* Created by anwar on 10/6/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            _Memory = new TSOS.Memory();
        }
        /**
        * Returns the Memory Contents at the index
        * @param index
        * @returns {string}
        */
        MemoryManager.prototype.read = function (index) {
            if (parseInt(_CurrentProcess.getBase() + index) > parseInt(_CurrentProcess.getLimit()) || parseInt(_CurrentProcess.getBase() + index) < parseInt(_CurrentProcess.getBase())) {
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_BSOD, "Illegal Memory Access");
                _CurrentProcess.setState(4);
                TSOS.Shell.updateReadyQueue();
            } else {
                return _Memory.read(parseInt(_CurrentProcess.getBase() + index));
            }
        };

        /**
        * Stores the element at the index
        * @param index
        * @param str
        */
        MemoryManager.prototype.store = function (index, str) {
            if (parseInt(_CurrentProcess.getBase() + index) > parseInt(_CurrentProcess.getLimit()) || parseInt(_CurrentProcess.getBase() + index) < parseInt(_CurrentProcess.getBase())) {
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_BSOD, "Illegal Memory Access");
                _CurrentProcess.setState(4);
                TSOS.Shell.updateReadyQueue();
            } else {
                _Memory.store(parseInt(_CurrentProcess.getBase() + index), str.toUpperCase().toString());
            }
        };

        MemoryManager.prototype.load = function (base, str) {
            _Memory.loadProgram(base, str);
        };

        /**
        * Clears Memory
        */
        MemoryManager.prototype.clearMemory = function () {
            _StdOut.putText("Memory Wiped!");
            _Memory.clearMemory();
        };

        /**
        * Updates the Memory
        */
        MemoryManager.prototype.update = function () {
            _Memory.updateMemory();
        };

        /**
        * Returns Memory Size
        * @returns {number}
        */
        MemoryManager.prototype.size = function () {
            return _Memory.size();
        };

        /**
        * Gets the next available block
        *
        * @returns {number}
        */
        MemoryManager.prototype.getBlockAvailable = function () {
            if (_ResidentQueue.length >= 3) {
                return -1;
            } else {
                for (var base = 0; base <= (_BlockSize * 2); base += _BlockSize) {
                    var address = _Memory.read(base);
                    if (address == "00") {
                        return base;
                    }
                }
            }
        };

        MemoryManager.prototype.clearBlock = function (base) {
            _Memory.clearBlock(base);
        };

        MemoryManager.prototype.copyBlock = function (process) {
            return _Memory.copyBlock(process);
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
