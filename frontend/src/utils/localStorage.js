const SELECTED_FLAT_KEY = 'smart-energy-selected-flat';

export const getSelectedFlatId = () => window.localStorage.getItem(SELECTED_FLAT_KEY);
export const setSelectedFlatId = (flatId) => {
  if (flatId) {
    window.localStorage.setItem(SELECTED_FLAT_KEY, String(flatId));
  } else {
    window.localStorage.removeItem(SELECTED_FLAT_KEY);
  }
};
