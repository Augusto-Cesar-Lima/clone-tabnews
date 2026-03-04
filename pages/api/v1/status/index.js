function status(request, response) {
  response.status(200).json({ mensagem: "Testando API" });
}

export default status;
