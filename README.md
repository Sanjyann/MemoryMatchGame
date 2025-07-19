# 🧠 Memory Match Deluxe

An enhanced and feature-rich version of the classic card-matching memory game. Built with vanilla JavaScript, HTML, and Bootstrap, this project demonstrates a wide range of modern front-end features, from dynamic theming and local storage to accessibility and audio integration.

**Link : [https://sanjyann.github.io/MemoryMatchGame/]**

*Screenshot of Memory Match Game*
<img width="1897" height="926" alt="image" src="https://github.com/user-attachments/assets/0410a658-205c-42ae-8ad8-26432d0a5e04" />


*Dark mode.*
<img width="1903" height="927" alt="image" src="https://github.com/user-attachments/assets/41988664-80cc-4b1f-8eb5-de3a18e15b37" />

---

## ✨ Features

This version is packed with new features to create a complete and engaging user experience:

* **🎨 Multiple Themes:** Choose from 5 different emoji themes to keep the game fresh:
    * Animals 🐶, Food 🍕, Sports ⚽️, Travel ✈️, and Flags 🏁.
* **🌓 Light & Dark Mode:** A sleek UI toggle allows you to switch between light and dark modes. Your preference is automatically saved in your browser for your next visit.
* **💡 Hint System:** Stuck? Use the "Hint" button to reveal a matching pair. You get 3 hints per game!
* **🏆 Best Time Tracking:** The game saves your best completion time for each difficulty level, challenging you to beat your own records.
* **🎉 Winning Animations:** A fun confetti explosion celebrates your victory when you complete the board.
* **⌨️ Full Keyboard Accessibility:** The entire game is navigable and playable using only a keyboard, adhering to modern accessibility (a11y) standards.
* **🔊 Sound Effects:** Interactive audio cues for flipping cards, finding a match, using a hint, and winning the game, powered by `Tone.js`.
* **⚙️ Multiple Difficulty Levels:** Test your skills with Easy (4x3), Medium (4x4), and Hard (5x4) grid sizes.
* **📱 Fully Responsive:** The layout is optimized for a seamless experience on all devices, from mobile phones to desktops.

---

## 🎮 How to Play

1.  **Configure Your Game:** Use the dropdowns at the top to select your preferred **Difficulty** and **Theme**.
2.  **Start Playing:** Click the "New Game" button or click on any card to begin. The timer starts with your first move.
3.  **Flip Cards:** Click on a card (or use the keyboard) to reveal the emoji underneath.
4.  **Find Pairs:** Select a second card to see if it's a match.
    * If they match, they stay face-up.
    * If not, they flip back over after a moment.
5.  **Use a Hint:** If you're stuck, press the "Hint" button to get a clue.
6.  **Win:** The game is won when all pairs have been matched. Your stats will be displayed in a celebratory pop-up!

### ⌨️ Keyboard Controls

| Key           | Action                               |
| :------------ | :----------------------------------- |
| `Arrow Keys`  | Navigate between cards on the grid.  |
| `Enter` / `Space` | Flip the currently focused card.     |
| `Tab`         | Move between buttons and the grid.   |

---

## 🛠️ Technologies Used

* **HTML5:** For the core semantic structure.
* **CSS3:** For custom styling, theming (via CSS Variables), and animations.
* **JavaScript (ES6+):** For all game logic, state management, and DOM manipulation.
* **Bootstrap 5:** For the responsive layout, modals, and UI components.
* **Bootstrap Icons:** For the light/dark mode toggle icons.
* **Tone.js:** For generating lightweight and interactive audio effects in the browser.

---
