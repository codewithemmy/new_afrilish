const createUserValidation = {
  fullName: {
    notEmpty: true,
    errorMessage: "fullName cannot be empty",
    trim: true,
  },
  phone: {
    notEmpty: true,
    errorMessage: "phone cannot be empty",
    trim: true,
  },
  language: {
    notEmpty: true,
    errorMessage: "language cannot be empty",
    trim: true,
  },
  email: {
    notEmpty: true,
    isEmail: true,
    errorMessage: "Email cannot be empty",
    trim: true,
  },
}

export default createUserValidation
