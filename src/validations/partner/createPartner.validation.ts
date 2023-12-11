const createPartnerValidation = {
  fullName: {
    notEmpty: true,
    errorMessage: "fullName cannot be empty",
    trim: true,
  },
  password: {
    notEmpty: true,
    errorMessage: "password cannot be empty",
    trim: true,
  },
  phone: {
    notEmpty: true,
    errorMessage: "phone cannot be empty",
    trim: true,
  },
  email: {
    notEmpty: true,
    isEmail: true,
    errorMessage: "Email cannot be empty",
    trim: true,
  },
}

export default createPartnerValidation
