module.exports.Background = {
   Black: '40',
   Red: '41',
   Green: '42',
   Yellow: '43',
   Blue: '44',
   Magenta: '45',
   Cyan: '46',
   White: '47'
}

module.exports.Foreground = {
   Black: '30',
   Red: '31',
   Green: '32',
   Yellow: '33',
   Blue: '34',
   Magenta: '35',
   Cyan: '36',
   White: '37',
   BrightBlack: '90',
   BrightRed: '91',
   BrightGreen: '92',
   BrightYellow: '93',
   BrightBlue: '94',
   BrightMagenta: '95',
   BrightCyan: '96',
   BrightWhite: '97'
}

module.exports.TextAttribute = {
   Clear: '0',
   Bold: '1',
   Dim: '2',
   Underscore: '4',
   Blink: '5',
   Reverse: '7'
}

module.exports.Class = class Ansi {

   clearScreen() {
      this.writeText('\u001b[2J');
      this.setCursorPosition(0, 0);
   }

   hideCursor() {
      this.writeText('\u001b[?25l');
   }

   setAttribute(attrib) {
      this.writeText('\u001b[' + attrib + 'm');
   }

   setBackground(color) {
      this.writeText('\u001b[' + color + 'm');
   }

   setCursorPosition(line, column) {
      let l = line + 1;
      let c = column + 1;
      this.writeText('\u001b[' + l.toString() + ';' + c.toString() + 'H');
   }

   setForeground(color) {
      this.writeText('\u001b[' + color + 'm');
   }

   showCursor() {
      this.writeText('\u001b[?25h');
   }

   writeLine(text) {
      this.writeText(text + '\n');
   }

   writeText(text) {
      process.stdout.write(text);
   }

}

