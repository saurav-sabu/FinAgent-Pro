import { useEffect } from 'react';

/**
 * A custom hook to execute a callback when a specific key combination is pressed.
 * 
 * @param {string} key - The `KeyboardEvent.key` value to listen for (e.g., 'Escape', '/', 'Enter').
 * @param {Function} callback - The function to execute when the key is pressed.
 * @param {Object} options - Modifier requirements.
 * @param {boolean} options.ctrl - If true, requires the Ctrl key to be pressed.
 * @param {boolean} options.meta - If true, requires the Meta/Command key to be pressed.
 * @param {boolean} options.prevent - If true, calls `e.preventDefault()` on the event.
 */
const useKeyPress = (key, callback, options = {}) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Check modifier requirements if specified
            const modifiersMatch =
                (options.ctrl === undefined || event.ctrlKey === options.ctrl) &&
                (options.meta === undefined || event.metaKey === options.meta);

            // Ignore inputs if the user is typing inside an editable field, unless we're explicitly trying to override it
            // For example, '/' to search shouldn't trigger if they are already typing a search query
            const isInputEvent = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;

            // Bypass input check if the hook explicitly allows it (e.g. Chat Submission inside a textarea)
            const bypassInputCheck = options.allowInInput === true;

            if (event.key === key && modifiersMatch && (!isInputEvent || bypassInputCheck)) {
                if (options.prevent) {
                    event.preventDefault();
                }
                callback(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [key, callback, options]);
};

export default useKeyPress;
