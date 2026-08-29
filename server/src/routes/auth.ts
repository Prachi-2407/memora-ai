import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../database/postgres";

import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth";

const router = Router();

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
}

/* =====================================================
   SIGN UP
===================================================== */

router.post(
  "/signup",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          message: "Name is required",
        });
      }

      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      if (
        typeof password !== "string" ||
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      /* ================= CHECK EXISTING USER ================= */

      const existingResult =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE email = $1
          `,
          [
            normalizedEmail,
          ]
        );

      if (
        existingResult.rows.length >
        0
      ) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      /* ================= HASH PASSWORD ================= */

      const passwordHash =
        await bcrypt.hash(
          password,
          10
        );

      /* ================= INSERT USER ================= */

      const result =
        await pool.query<UserRow>(
          `
          INSERT INTO users
          (
            name,
            email,
            password_hash
          )
          VALUES ($1, $2, $3)

          RETURNING
            id,
            name,
            email,
            password_hash
          `,
          [
            name.trim(),
            normalizedEmail,
            passwordHash,
          ]
        );

      const user =
        result.rows[0];

      if (!user) {
        throw new Error(
          "Failed to create user"
        );
      }

      /* ================= CREATE JWT ================= */

      const secret =
        process.env.JWT_SECRET;

      if (!secret) {
        throw new Error(
          "JWT_SECRET is missing"
        );
      }

      const token =
        jwt.sign(
          {
            userId:
              user.id,
          },
          secret,
          {
            expiresIn: "7d",
          }
        );

      return res
        .status(201)
        .json({
          token,

          user: {
            id:
              user.id,

            name:
              user.name,

            email:
              user.email,
          },
        });
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to create account",
        });
    }
  }
);

/* =====================================================
   LOGIN
===================================================== */

router.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        typeof email !==
          "string" ||
        typeof password !==
          "string"
      ) {
        return res
          .status(400)
          .json({
            message:
              "Email and password are required",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      /* ================= FIND USER ================= */

      const result =
        await pool.query<UserRow>(
          `
          SELECT
            id,
            name,
            email,
            password_hash
          FROM users
          WHERE email = $1
          `,
          [
            normalizedEmail,
          ]
        );

      const user =
        result.rows[0];

      if (!user) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password",
          });
      }

      /* ================= VERIFY PASSWORD ================= */

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password_hash
        );

      if (
        !passwordMatches
      ) {
        return res
          .status(401)
          .json({
            message:
              "Invalid email or password",
          });
      }

      /* ================= JWT ================= */

      const secret =
        process.env.JWT_SECRET;

      if (!secret) {
        throw new Error(
          "JWT_SECRET is missing"
        );
      }

      const token =
        jwt.sign(
          {
            userId:
              user.id,
          },
          secret,
          {
            expiresIn: "7d",
          }
        );

      return res.json({
        token,

        user: {
          id:
            user.id,

          name:
            user.name,

          email:
            user.email,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to login",
        });
    }
  }
);

/* =====================================================
   CURRENT USER
===================================================== */

router.get(
  "/me",
  requireAuth,
  async (
    req: AuthRequest,
    res
  ) => {
    try {
      const userId =
        req.userId;

      if (!userId) {
        return res
          .status(401)
          .json({
            message:
              "Authentication required",
          });
      }

      const result =
        await pool.query<{
          id: number;
          name: string;
          email: string;
        }>(
          `
          SELECT
            id,
            name,
            email
          FROM users
          WHERE id = $1
          `,
          [
            userId,
          ]
        );

      const user =
        result.rows[0];

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error(
        "Failed to fetch user:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Failed to fetch user",
        });
    }
  }
);

export default router;