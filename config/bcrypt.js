import bcrypt from "bcryptjs";

/**
 * Hashes a plain-text password using bcrypt.
 * @param {string} password - Plain-text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.SALT) || 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password against a bcrypt hash.
 * @param {string} plain - The plain-text password to check
 * @param {string} hashed - The stored hashed password
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};
