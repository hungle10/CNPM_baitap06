import { Row, Col, Form, Input, Button, notification } from "antd";
import axios from "../util/axios.customize";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const email = search.get("email");
  const otp = search.get("otp");

  const onFinish = async ({ password }) => {
    try {
      const res = await axios.post("/v1/api/reset-password", {
        email,
        otp,
        password,
      });

      notification.success({
        message: "RESET PASSWORD",
        description: res.message,
      });

      navigate("/login");
    } catch (err) {
      notification.error({
        message: "RESET PASSWORD",
        description: err?.message || "Lỗi xảy ra",
      });
    }
  };

  return (
    <Row justify="center" style={{ marginTop: 30 }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: 15, border: "1px solid #ccc" }}>
          <legend>Đặt lại mật khẩu</legend>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Mật khẩu mới"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject("Mật khẩu không khớp!");
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Đổi mật khẩu
            </Button>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
}