const Ansi = require('./Ansi.js');
const Format = require('./Format.js');
const Ram = require('./Ram.js');

const Gpio = require('onoff').Gpio;


module.exports.Class = class App {

   //
   // Constructor
   //
   constructor() {

      this.ansi = new Ansi.Class();
      this.format = new Format.Class();
      this.ram = new Ram.Class();

      //-----

      // System Clock
      //
      // RPi Pin [ 3 ]
      this.clockGpio = new Gpio(2, 'out');

      // Address Bus
      //
      //    CPU Address Bus [ 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15 ]
      //           RPi Pins [  7,  8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 22, 23, 24, 26, 29 ]
      this.addressGpioIds = [  4, 14, 15, 17, 18, 27, 22, 23, 24, 10,  9, 25, 11,  8,  7,  5 ];

      this.addressGpio = [];
      for (let i = 0; i < this.addressGpioIds.length; i++) {
         let gpio = new Gpio(this.addressGpioIds[i], 'in');
         this.addressGpio.push(gpio);
      }

      // Data Bus
      //
      //    CPU Data Bus [ 00, 01, 02, 03, 04, 05, 06, 07 ]
      //        RPi Pins [ 31, 32, 33, 35, 36, 37, 38, 40 ]
      this.dataGpioIds = [  6, 12, 13, 19, 16, 26, 20, 21 ];

      this.dataGpio = [];
      for (let i = 0; i < this.dataGpioIds.length; i++) {
         let gpio = new Gpio(this.dataGpioIds[i], 'out');
         this.dataGpio.push(gpio);
      }

      // Data Read/Write
      //
      // RPi Pin [ 5 ]
      this.dataGpioRW = new Gpio(3, 'in');
      
      //-----

      this.clockRunning = false;
      this.clockId = 0;
      this.clockSpeed = 1; //in Hz

      this.currentAddress = 0;
      this.currentData = 0;
      this.currentDataRW = 0;

   }


   //
   // Main entry point
   //
   main() {

      let stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let ansi = this.ansi;
      ansi.clearScreen();

      let format = this.format;

      let ram = this.ram;
      this.render();

      let self = this;
      stdin.on('data', function (key) {

         // 'UP ARROW' Previous Memory Page
         if (key == '\u001B\u005B\u0041') {
            ram.previousPage();
            self.renderRam();
         }

         // 'DOWN ARROW' Next Memory Page
         else if (key == '\u001B\u005B\u0042') {
            ram.nextPage();
            self.renderRam();
         }

         // 'LEFT ARROW' Previous Memory Bank
         else if (key == '\u001B\u005B\u0044') {
            ram.previousBank();
            self.renderRam();
         }

         // 'RIGHT ARROW' Next Memory Bank
         else if (key == '\u001B\u005B\u0043') {
            ram.nextBank();
            self.renderRam();
         }

         // ----------

         // 'S' Start/Stop Clock
         else if (key == '\u0073') {
            self.toggleClock();
         }

         // 'SPACE' Step Clock
         else if (key == '\u0020') {
            self.stepClock();
         }

         // '+' Clock Faster
         else if ((key == '\u002B') || (key == '\u003D')) {
            self.increaseClock();
         }

         // '-' Clock Slower
         else if ((key == '\u002D') || (key == '\u001F')) {
            self.decreaseClock();
         }

         // ----------

         /*
         else if ((key == 'r') || (key == 'R')) {

            let data = self.readData();

            ansi.setCursorPosition(0,60);
            ansi.writeText('R: ');
            ansi.writeText(format.toHex(data, 2));
      
         }

         else if ((key == 'w') || (key == 'W')) {

            self.dataValue 
            self.writeData(self.dataValue);
            ansi.setCursorPosition(0,60);
            ansi.writeText('W: ');
            ansi.writeText(format.toHex(self.dataValue, 2));
            self.dataValue++;
      
         }
         */

         // 'Q' Quit
         else if (key == '\u0071') {
            process.exit();
         }

         // Unrecognized keystroke, dump some info
         else {
            ansi.setCursorPosition(0, 60);
            ansi.writeText(format.toUnicode(key));
         }

      });

   }


   //---------------------------------------------------------------------------

   
   //
   // readAddress - read from CPU address bus
   //
   readAddress() {

      let address = 0;

      for (let i = this.addressGpioIds.length-1; i >= 0; i--) {
         address = (address << 1) + this.addressGpio[i].readSync();
      }
      
      return address;

   }


   //
   // readData - read from CPU data bus
   //
   readData() {

      let data = 0;

      for (let i = this.dataGpioIds.length-1; i >= 0; i--) {
         data = (data << 1) + this.dataGpio[i].readSync();
      }
      
      return data;

   }


   //
   // writeData - write to CPU data bus
   //
   writeData(data) {

      for (let i = 0; i < this.dataGpioIds.length; i++) {
         this.dataGpio[i].writeSync(data & 1);
         data = data >> 1;
      }

   }


   //---------------------------------------------------------------------------


   //
   // onClockTick 
   //
   onClockTick() {

      this.stepClock();

      let intervalMs = (1000 / this.clockSpeed) / 2;
      this.clockId = setTimeout(() => this.onClockTick(), intervalMs);

   }


   //
   // decreaseClock
   //
   decreaseClock() {

      this.clockSpeed -= 1;
      if (this.clockSpeed < 1) {
         this.clockSpeed = 1;
      }

   }


   //
   // increaseClock
   //
   increaseClock() {

      this.clockSpeed += 1;
      if (this.clockSpeed > 20) {
         this.clockSpeed = 20;
      }

   }


   //
   // stepClock
   //
   stepClock() {

      let pin = this.clockGpio;
      if (pin.readSync() === 0) {
         pin.writeSync(1);
      } else {
         pin.writeSync(0);
      }

      this.renderClock();
      
      this.currentAddress = this.readAddress();
      this.renderAddress();

      let dataRW = this.dataGpioRW.readSync();
      if (dataRW != this.currentDataRW)
      {
         let direction = (dataRW == 0) ? 'in' : 'out';
         for (let i = 0; i < this.dataGpio.length; i++) {
            this.dataGpio[i].setDirection(direction);
         }
         this.currentDataRW = dataRW;
      }

      //CPU writing to memory
      if (this.currentDataRW == 0) {
         this.currentData = this.readData();
         this.ram.writeAddress(this.currentAddress, this.currentData);
      }

      //CPU reading from memory
      else {
         this.currentData = this.ram.readAddress(this.currentAddress);
         this.writeData(this.currentData);
      }

      this.renderData();

      this.renderRam();
      
      this.parkCursor();
  
   }


   //
   // toggleClock
   //
   toggleClock() {

      if (this.clockRunning == false) {

         let intervalMs = (1000 / this.clockSpeed) / 2;
         this.clockId = setTimeout(() => this.onClockTick(), intervalMs);
         this.clockRunning = true;

      } else {

         clearTimeout(this.clockId);
         this.clockRunning = false;
      
      }

      this.renderClock();

   }


   //---------------------------------------------------------------------------


   //
   // parkCursor
   //
   parkCursor() {

      this.ansi.setCursorPosition(22, 71);

   }


   //
   // render
   //
   render() {

      this.renderTemplate();

      this.renderAddress();
      this.renderData();
      this.renderClock();
      this.renderRam();

   }


   //
   // renderAddress
   //
   renderAddress() {

      let ansi = this.ansi;
      let format = this.format;

      ansi.hideCursor();
      ansi.setCursorPosition(3, 5);

      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.BrightWhite);
      ansi.writeText('........ ........ = $' + format.toHex(this.currentAddress, 4));
      
      this.parkCursor();
      ansi.showCursor();

   }


   //
   // renderClock
   //
   renderClock() {

      let ansi = this.ansi;
      ansi.hideCursor();

      ansi.setCursorPosition(3, 54);

      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.BrightWhite);

      if (this.clockRunning) {
         ansi.writeText('RUN ' + this.clockSpeed + 'Hz =');
      } else {
         ansi.writeText('STEPPING = ');
      }

      ansi.setCursorPosition(3, 65);

      let pin = this.clockGpio;
      if (pin.readSync() === 0) {
         ansi.writeText('LO ▄');
      } else {
         ansi.writeText('HI ▀');
      }

      this.parkCursor();
      ansi.showCursor();

   }


   //
   // renderData
   //
   renderData() {

      let ansi = this.ansi;
      let format = this.format;

      ansi.hideCursor();
      ansi.setCursorPosition(3, 34);

      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.BrightWhite);
      
      let state = (this.currentDataRW == 0) ? 'W ' : 'R ';
      ansi.writeText(state + '........ = $' + format.toHex(this.currentData, 2));

      this.parkCursor();
      ansi.showCursor();

   }


   //
   // renderRam
   //
   renderRam() {

      let ansi = this.ansi;
      ansi.hideCursor();

      ansi.setCursorPosition(5, 0);

      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.White);

      this.ram.renderPage();
      
      this.parkCursor();
      ansi.showCursor();

   }


   //
   // renderTemplate
   //
   renderTemplate() {

      let ansi = this.ansi;
      ansi.hideCursor();

      ansi.setCursorPosition(1, 0);      
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.Cyan);
      ansi.writeLine('╔════════════════════════════════════════════════════════════════════════╗');
      ansi.writeLine('║                                                                        ║');
      ansi.writeLine('║                                                                        ║');
      ansi.writeLine('╚════════════════════════════════════════════════════════════════════════╝');

      ansi.setCursorPosition(21, 0);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.Cyan);
      ansi.writeLine('╔════════════════════════════════════════════════════════════════════════╗');
      ansi.writeLine('║                                                                        ║');
      ansi.writeLine('╚════════════════════════════════════════════════════════════════════════╝');

      ansi.setCursorPosition(0, 0);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.BrightYellow);
      ansi.writeLine('  The Ramulator');

      ansi.setCursorPosition(2, 4);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setAttribute(Ansi.TextAttribute.Underscore);
      ansi.setForeground(Ansi.Foreground.Cyan);
      ansi.writeText('          ADDRESS          ');

      ansi.setCursorPosition(2, 34);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setAttribute(Ansi.TextAttribute.Underscore);
      ansi.setForeground(Ansi.Foreground.Cyan);
      ansi.writeText('      DATA      ');

      ansi.setCursorPosition(2, 53);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setAttribute(Ansi.TextAttribute.Underscore);
      ansi.setForeground(Ansi.Foreground.Cyan);
      ansi.writeText('      CLOCK      ');

      ansi.setCursorPosition(22, 5);
      ansi.setAttribute(Ansi.TextAttribute.Clear);
      ansi.setForeground(Ansi.Foreground.Green);
      ansi.writeText('R = RESET   S = START/STOP CLOCK   SPC = SINGLE STEP   Q = QUIT');

      this.parkCursor();
      ansi.showCursor();

   }


   //---------------------------------------------------------------------------


}

