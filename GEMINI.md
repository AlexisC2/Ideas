# Project: Random Idea Generator

## Project Overview

This project is a simple, single-page web application that generates random ideas for mini-projects or side hustles. It is built using fundamental front-end technologies: HTML, CSS, and vanilla JavaScript. The application presents a clean, user-friendly interface with a button that, when clicked, displays a new random idea from a predefined list.

### Key Technologies
*   **HTML:** Structures the web page content.
*   **CSS:** Styles the application for a visually appealing and modern look.
*   **JavaScript:** Implements the core logic for randomly selecting and displaying ideas.

### Architecture
The application follows a simple, client-side architecture:
*   `index.html`: The main entry point and structure of the application.
*   `style.css`: Handles all visual styling.
*   `idea.js`: A static list of idea strings.
*   `app.js`: Contains the event handling and DOM manipulation logic.

## Building and Running

This is a static web project with no build process required.

### Running the Application
To run the application, simply open the `index.html` file in any modern web browser.

## Development Conventions

The codebase is straightforward and does not adhere to a specific, formal style guide. However, it demonstrates good practices for a small project:
*   **Separation of Concerns:** HTML, CSS, and JavaScript are kept in separate files.
*   **Clear Naming:** Variables and DOM element IDs (`generateBtn`, `ideaDisplay`) are named descriptively.
*   **Static Data:** The list of ideas is maintained in a separate `idea.js` file, making it easy to update or modify without touching the core application logic.