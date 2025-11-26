import { Row, Col, Form, Input, Button, notification } from "antd";
import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../util/axios.customize";

export default function VerifyOTP() {
  const [search] = useSearchParams();
  const email = search.get("email") || "";
  const navigate = useNavigate();

  const inputs = Array(6).fill(0);
  const refs = useRef([]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      refs.current[index + 1].focus();
    }
  };

  // ⛳ Xác nhận OTP
  const handleVerify = async () => {
    const code = otp.join("");

    try {
      const res = await axios.post("/v1/api/check-otp", {
        email,
        otp: code,
      });

      notification.success({
        message: "OTP",
        description: res.message,
      });

      navigate(`/reset-password?email=${email}&otp=${code}`);
    } catch (err) {
      notification.error({
        message: "OTP",
        description: err?.message || "OTP không đúng",
      });
    }
  };

  return (
    <Row justify="center" style={{ marginTop: 30 }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: 15, border: "1px solid #ccc" }}>
          <legend>Nhập mã OTP</legend>

          <p style={{ marginBottom: 15 }}>
            Mã OTP đã được gửi đến email: <b>{email}</b>
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {inputs.map((_, idx) => (
              <Input
                key={idx}
                maxLength={1}
                value={otp[idx]}
                onChange={(e) => handleChange(e.target.value, idx)}
                ref={(el) => (refs.current[idx] = el)}
                style={{
                  width: 45,
                  height: 45,
                  textAlign: "center",
                  fontSize: 18,
                }}
              />
            ))}
          </div>

          {/* Button xác nhận */}
          <Button
            type="primary"
            onClick={handleVerify}
            disabled={otp.join("").length !== 6}
            style={{ marginTop: 20, width: "100%" }}
          >
            Xác nhận
          </Button>
        </fieldset>
      </Col>
    </Row>
  );
}
