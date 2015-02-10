/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME = "BAD ASS OS";
var APP_VERSION = "9.1.5";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 100;

// Global Variables
//
var _CPU;

var _OSclock = 0;
var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;
var _KernelModeBit = 0;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

/*INTERRUPT CASES */
var _ROLLIN = 990;
var _READ = 991;
var _DELETE = 992;
var _CREATE = 993;
var _LS = 994;

// MEMORY INFO
var _MainMemory = null;
var _MainMemorySize = 768;
var _MainMemoryBase = null;
var _Memory;
var _BlockSize = 256;
var _MemoryManager;

//Ready and Resident Queues
var _ResidentQueue = null;
var _ReadyQueue;
var _CurrentProcess = null;
var _RUN = -5;
var _RUNALL = -10;
var _ClockCycle = 0;
var _ContextSwitch = 915;
var _TerminatedQueue = null;
var _Killed = 89;
var _BSOD = -200;
var _KilledReset = -100;
var _KilledRunAll = -101;

//history of commands
var _ConsoleHistory = null;

//step button to control the stepping
var _StepButton = false;
var _NextButton = false;

//Op Code to break
var _Break = -1;

//System Call
var _SystemCall = 9;
var _InvalidOpCode = 999;
var _MemoryBoundError = -20;

//File System
var _FileSystem;

// CPU Scheduling
var _Quantum = 6;
var _CurrentScheduler;
var _CurrentSchedule = null;

//Program File Name
var _ProgramFile = "swap";

//Color for the Logger!
var _FancyColor = 0;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
