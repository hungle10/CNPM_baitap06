import { Row, Col, Form, Input, Button, notification } from "antd";
import axios from "../util/axios.customize";
import { useNavigate, useSearchParams } from "react-router-dom";
import React from "react";

export default function ResetPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [form] = Form.useForm();
  const email = search.get("email");
  const otp = search.get("otp");

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { newPassword } = values;
      const res = await axios.post("/v1/api/reset-password", {
        email,
        otp,
        newPassword,
      });

      notification.success({
        message: "Đặt lại mật khẩu",
        description: res.EM || "Đặt lại mật khẩu thành công",
      });

      form.resetFields();
      navigate("/login");
    } catch (err) {
      notification.error({
        message: "Đặt lại mật khẩu",
        description: err?.response?.data?.EM || "Lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ marginTop: 30 }}>
      <Col xs={24} md={16} lg={8}>
        <fieldset style={{ padding: 15, border: "1px solid #ccc", borderRadius: "5px" }}>
          <legend>Đặt lại mật khẩu</legend>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                {
                  min: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự!",
                },
                {
                  pattern: /[A-Z]/,
                  message: "Mật khẩu phải có ít nhất một ký tự in hoa!",
                },
                {
                  pattern: /[0-9]/,
                  message: "Mật khẩu phải có ít nhất một chữ số!",
                },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </Form.Item>

            <Button type="primary" htmlType="submit" style={{ width: "100%" }} loading={loading}>
              Đổi mật khẩu
            </Button>
          </Form>
        </fieldset>
      </Col>
    </Row>
  );
}
