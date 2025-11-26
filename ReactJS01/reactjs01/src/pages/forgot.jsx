import { Row, Col, Form, Input, Button, Divider, notification } from "antd";
import axios from "../util/axios.customize";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function Forgot() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ email }) => {
    try {
      setLoading(true);
      const res = await axios.post("/v1/api/forgot-password", { email });

      notification.success({
        message: "FORGOT PASSWORD",
        description: res.message,
      });

      navigate(`/verify-otp?email=${email}`);
    } catch (err) {
      notification.error({
        message: "FORGOT PASSWORD",
        description: err?.response?.data?.message || "Lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: 30 }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: 15, border: "1px solid #ccc" }}>
          <legend>Quên mật khẩu</legend>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </Button>
          </Form>

          <Divider />
          <Link to="/login">
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </fieldset>
      </Col>
    </Row>
  );
}
