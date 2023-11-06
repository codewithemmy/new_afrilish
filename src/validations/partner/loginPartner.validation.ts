const loginPartnerValidation = {
  password: {
    notEmpty: true,
    errorMessage: "password cannot be empty",
    trim: true,
  },
  email: {
    notEmpty: true,
    isEmail: true,
    errorMessage: "Email cannot be empty",
    trim: true,
  },
}

export default loginPartnerValidation
