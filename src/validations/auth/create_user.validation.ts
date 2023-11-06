const createUserValidation = {
  fullName: {
    notEmpty: true,
    errorMessage: "Full Name cannot be empty",
    trim: true,
  },
  email: {
    notEmpty: true,
    isEmail: true,
    errorMessage: "Email cannot be empty",
    trim: true,
  },
  phoneNumber: {
    notEmpty: true,
    errorMessage: "Phone number cannot be empty",
    trim: true,
  },
  password: {
    notEmpty: true,
    errorMessage: "Password cannot be empty",
    trim: true,
  },
  category: {
    notEmpty: true,
    errorMessage: "Category cannot be empty",
    trim: true,
  },
}

export default createUserValidation
