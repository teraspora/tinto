# Tinto

## A tool for creating colour palettes

### Development log

* 11 June 2019:
    Most functionality now implemented, except
        - Contrast ration calculation and display
        - Let user move modal
        - Write content for 'About' page

    Responsive layout CSS needs fixing!
    
    Don't re-generate on show/hide hex/lum, just do the show/hide!

    Improve UX for 'show-hex' when Luminance is showing.

    Don't display 'Remove' button for inactive palette slots.

    Refactor code to use a common method of getting DOM elements in the `#controls` grid, indexing them with `data-` attributes perhaps, and creating a general function for getting such an element, and other functions for things like toggling the state in various ways, so the code will be much cleaner and more modular.

    


