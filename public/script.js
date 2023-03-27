const search = async () => {
  const id = document.getElementById("input")?.value || null;
  const result = document.getElementById("result");
  if (id) {
    try {
      const response = await fetch(`/${id}`);
      result.innerHTML = await response.text();
    } catch (err) {
      result.innerHTML = "Неизвестная ошибка";
    }
  }
};
