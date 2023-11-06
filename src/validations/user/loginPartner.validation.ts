const loginUserValidation = {
  phone: {
    notEmpty: true,
    errorMessage: "phone cannot be empty",
    trim: true,
  },
}

export default loginUserValidation
