import jwt from "jsonwebtoken";

class GenrateToken {
  static accessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
  }
}

export default GenrateToken;
