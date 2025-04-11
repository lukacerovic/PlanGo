import { Alert } from "react-native"

export const useValidateRegistration = (formData) => {
  if (formData.password !== formData.confirmPassword) {
    Alert.alert("Error", "Passwords do not match!")
    return false 
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(formData.email)) {
    Alert.alert("Error", "Please enter a valid email address.")
    return false
  }

  const age = Number(formData.age)
  if (isNaN(age) || age <= 0 || age > 120) {
    Alert.alert("Error", "Please enter a valid age.")
    return false
  }

  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.password ||
    !formData.age ||
    formData.gender === "Select Gender"
  ) {
    Alert.alert("Error", "All fields are required.")
    return false
  }

  return true
}
