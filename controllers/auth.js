const query = require("../database");
const { randomUUID } = require("crypto");
const bcryptjs = require("bcryptjs");

async function register(req, res) {
  const { name, email, phoneNumber, password, confPassword, role } = req.body;

  if (
    name === undefined ||
    name === "" ||
    email === undefined ||
    email === "" ||
    phoneNumber === undefined ||
    isNaN(+phoneNumber) ||
    password === undefined ||
    password === "" ||
    confPassword === undefined ||
    confPassword === "" ||
    role === undefined ||
    role === ""
  )
    return res.status(400).json("Invalid data!");

  if (password !== confPassword) return res.status(400).json("Password not match!");

  try {
    const isDuplicate = await query(
      `
        SELECT id FROM siswa WHERE phone_number = ? OR email = ? 
    `,
      [phoneNumber, email]
    );

    if (isDuplicate.length > 0) return res.status(400).json("User already exists!");

    const salt = await bcryptjs.genSalt(12);
    const hash = await bcryptjs.hash(password, salt);

    await query(
      `
        INSERT INTO siswa (
            uuid, name, email, phone_number, password, role
        ) VALUES (
            ?, ?, ?, ?, ?, ?
        );
    `,
      [randomUUID(), name, email, phoneNumber, hash, role]
    );

    return res.status(200).json("Register success!");
  } catch (error) {
    return res.status(400).json("Something went wrong!");
  }
}

async function login(req, res) {
  const { emailOrPhoneNumber, password } = req.body;
  try {
    let user;
    if (emailOrPhoneNumber) {
      user = await query(
        `
        SELECT * FROM siswa WHERE email = ? OR phone_number = ?;
      `,
        [emailOrPhoneNumber, emailOrPhoneNumber]
      );
    } else {
      return res.status(400).json("Data yang Anda masukkan salah!");
    }

    if (!user || user.length === 0) {
      return res.status(404).json("User tidak terdaftar!");
    }

    const match = await bcryptjs.compare(password, user[0].password);
    if (!match) {
      return res.status(400).json("Password yang Anda masukkan salah!");
    }

    return res.status(200).json({ user: user[0] });
  } catch (error) {
    return res.status(400).json("Something went wrong!");
  }
}

module.exports = {
  register,
  login,
};
