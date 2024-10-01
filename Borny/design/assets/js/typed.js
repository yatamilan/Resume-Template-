// The MIT License (MIT)

// Typed.js | Copyright (c) 2014 Matt Boldt | www.mattboldt.com

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




// Immediately invoked function to create a local scope
!function ($) {
    "use strict"; // Enable strict mode for better error handling and cleaner code

    // Constructor function for creating a new Typed instance
    var Typed = function (el, options) {
        this.el = $(el); // Save the jQuery object for the target element
        // Merge user-defined options with default options using jQuery's extend method
        this.options = $.extend({}, $.fn.typed.defaults, options);
        // Get the base text from the element's current text or placeholder
        this.baseText = this.el.text() || this.el.attr('placeholder') || '';
        // Set the typing speed from options
        this.typeSpeed = this.options.typeSpeed;
        // Set the delay before starting typing
        this.startDelay = this.options.startDelay;
        // Set the speed of backspacing
        this.backSpeed = this.options.backSpeed;
        // Set the delay before starting to backspace
        this.backDelay = this.options.backDelay;
        // Get the array of strings to type
        this.strings = this.options.strings;
        // Initialize position for the current string
        this.strPos = 0;
        // Initialize the position in the strings array
        this.arrayPos = 0;
        // Initialize the stop position for backspacing
        this.stopNum = 0;
        // Determine if the typing effect should loop
        this.loop = this.options.loop;
        // Set how many times to loop through the strings
        this.loopCount = this.options.loopCount;
        // Track the current loop number
        this.curLoop = 0;
        // Flag to stop typing
        this.stop = false;
        // Decide whether to show the cursor (hide for input elements)
        this.showCursor = !this.el.is('input') && this.options.showCursor;
        // Store the character for the cursor
        this.cursorChar = this.options.cursorChar;
        // Determine which attribute to modify (text or placeholder)
        this.attr = this.options.attr || (this.el.is('input') ? 'placeholder' : null);
        // Call the build method to set up the typing effect
        this.build();
    };

    // Define methods for the Typed prototype
    Typed.prototype = {
        constructor: Typed, // Set the constructor reference

        // Method to initialize typing
        init: function () {
            var self = this; // Reference to the current Typed instance
            // Set a timeout to start typing after the start delay
            self.timeout = setTimeout(function () {
                // Start typing the current string at position 0
                self.typewrite(self.strings[self.arrayPos], self.strPos);
            }, self.startDelay);
        },

        // Method to build the typing effect
        build: function () {
            // If the cursor should be shown, create and append it
            if (this.showCursor) {
                this.cursor = $("<span class='typed-cursor'>" + this.cursorChar + "</span>"); // Create cursor element
                this.el.after(this.cursor); // Insert cursor after the target element
            }
            this.init(); // Call the init method to start typing
        },

        // Method to type a string
        typewrite: function (curString, curStrPos) {
            if (this.stop) return; // If stop flag is set, exit the function

            // Calculate a random delay for a more natural typing effect
            var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
            var self = this; // Reference to the current Typed instance

            // Set a timeout for typing the next character
            self.timeout = setTimeout(function () {
                var substr = curString.substr(curStrPos); // Get the substring starting from the current position
                // Check if the first character is a control character
                if (substr.charAt(0) === '^') {
                    // Check if it's a delay command (e.g., ^1000)
                    if (/^\^\d+/.test(substr)) {
                        // Extract the number from the command
                        substr = /\d+/.exec(substr)[0];
                        // Move the current string position forward by the extracted number
                        curStrPos += parseInt(substr);
                    }
                    // Update curString to remove control characters
                    curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
                }

                // Set a timeout to continue typing
                self.timeout = setTimeout(function () {
                    if (curStrPos === curString.length) { // If the entire string has been typed
                        self.options.onStringTyped(self.arrayPos); // Call the onStringTyped callback
                        if (self.arrayPos === self.strings.length - 1) { // If it's the last string
                            self.options.callback(); // Call the main callback
                            self.curLoop++; // Increment the current loop count
                            // Check if looping is enabled and if the maximum loop count is reached
                            if (!self.loop || self.curLoop === self.loopCount) return; // Exit if not looping
                        }
                        // Set a timeout to start backspacing after a delay
                        self.timeout = setTimeout(function () {
                            self.backspace(curString, curStrPos); // Call the backspace method
                        }, self.backDelay);
                    } else {
                        // If the current position is 0, call preStringTyped callback
                        if (curStrPos === 0) self.options.preStringTyped(self.arrayPos);
                        // Construct the text to display by adding the next character
                        var nextString = self.baseText + curString.substr(0, curStrPos + 1);
                        // If an attribute is defined, set it
                        if (self.attr) {
                            self.el.attr(self.attr, nextString); // Set the attribute (input or placeholder)
                        } else {
                            self.el.text(nextString); // Set the text for other elements
                        }
                        curStrPos++; // Move to the next character
                        self.typewrite(curString, curStrPos); // Recursively call typewrite to continue typing
                    }
                }, 30); // Short delay between typing each character
            }, humanize); // Randomized delay for a more natural typing speed
        },

        // Method to backspace a string
        backspace: function (curString, curStrPos) {
            if (this.stop) return; // If stop flag is set, exit the function

            // Calculate a random delay for backspacing
            var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
            var self = this; // Reference to the current Typed instance

            // Set a timeout for backspacing the next character
            self.timeout = setTimeout(function () {
                // Construct the text to show during backspacing
                var nextString = self.baseText + curString.substr(0, curStrPos);
                // If an attribute is defined, set it
                if (self.attr) {
                    self.el.attr(self.attr, nextString); // Set the attribute (input or placeholder)
                } else {
                    self.el.text(nextString); // Set the text for other elements
                }

                // If we haven't finished backspacing yet
                if (curStrPos > self.stopNum) {
                    curStrPos--; // Move the current position back by one
                    self.backspace(curString, curStrPos); // Recursively call backspace to continue
                } else {
                    self.arrayPos++; // Move to the next string in the array
                    // If we've reached the end of the strings array, reset to the start
                    if (self.arrayPos === self.strings.length) {
                        self.arrayPos = 0; // Reset to the first string
                        self.init(); // Restart typing
                    } else {
                        // Continue typing the next string
                        self.typewrite(self.strings[self.arrayPos], curStrPos);
                    }
                }
            }, humanize); // Randomized delay for backspacing
        },

        // Method to reset the typing effect
        reset: function () {
            var self = this; // Reference to the current Typed instance
            clearInterval(self.timeout); // Clear any existing timeout
            var id = this.el.attr('id'); // Get the id of the current element
            // Insert a new span element in place of the original
            this.el.after('<span id="' + id + '"/>')
            this.el.remove(); // Remove the old element
            // If a cursor was created, remove it
            if (this.cursor) this.cursor.remove();
            self.options.resetCallback(); // Call the reset callback function
        }
    };

    // jQuery plugin definition for Typed
    $.fn.typed = function (option) {
        return this.each(function () {
            var $this = $(this), // Current jQuery element
                data = $this.data('typed'), // Get the existing Typed instance
                options = typeof option === 'object' && option; // Check if options are provided
            // Create a new Typed instance if none exists
            if (!data) $this.data('typed', (data = new Typed(this, options)));
            // If option is a string, call the corresponding method
            if (typeof option === 'string') data[option]();
        });
    };

    // Default options for the Typed plugin
    $.fn.typed.defaults = {
        strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"], // Default strings to type
        typeSpeed: 50, // Default typing speed
        startDelay: 0, // Default start delay
        backSpeed: 50, // Default backspacing speed
        backDelay: 1500, // Default delay after typing before backspacing
        loop: true, // Default to looping the typing effect
        loopCount: false, // Default loop count (false means infinite)
        showCursor: true, // Default to showing the cursor
        cursorChar: "|", // Default character for the cursor
        attr: null, // Default attribute to modify (null means text)
        callback: function () {}, // Default callback after typing
        preStringTyped: function () {}, // Default callback before typing a new string
        onStringTyped: function () {}, // Default callback after typing a string
        resetCallback: function () {} // Default callback on reset
    };

}(window.jQuery); // End of the immediately invoked function
