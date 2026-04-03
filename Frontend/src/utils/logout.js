export const logout = () => {
  // 🔥 Clear EVERYTHING (no leftovers)
  localStorage.clear();

  // 🔥 Optional: clear sessionStorage too (extra safety)
  sessionStorage.clear();

  // 🔥 Force hard reload (kills all React state)
  window.location.replace("/get-started");
};