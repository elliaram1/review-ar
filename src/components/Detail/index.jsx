import React from "react";
import moment from "moment";
import {
  List,
  Avatar,
  Button,
  Form,
  Input,
  Image,
  Rate,
  Comment,
  notification,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";
import {
  createTransaction,
  signAndDeployTransaction,
  getDataByArql,
  renderAddress,
} from "../../utils/utils";
const { TextArea } = Input;

class Detail extends React.Component {
  state = {
    comment: "",
    comments: [],
  };

  async componentDidMount() {
    const comments = await this.getComment();
    this.setState({ comments, loading: false });
  }

  getComment = async () => {
    const { data } = this.props;
    try {
      const comments = await getDataByArql({
        op: "and",
        expr1: {
          op: "equals",
          expr1: "appname",
          expr2: "review-ar",
        },
        expr2: {
          op: "and",
          expr1: {
            op: "equals",
            expr1: "type",
            expr2: "comment",
          },
          expr2: {
            op: "equals",
            expr1: "id",
            expr2: data.id.toString(),
          },
        },
      });
      return comments;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  onChange = (e) => {
    this.setState({
      comment: e.target.value,
    });
  };

  onSubmit = async () => {
    const { data, wallet, address } = this.props;
    const { comment } = this.state;
    try {
      if (!address || !wallet ) {
        notification.error({
          message: "Error",
          description: "Please login your wallet!",
        });
        return
      }
      this.setState({ submitting: true });
      const body = {
        comment,
        timestamp: Date.now(),
        by: address,
      };
      let transaction = await createTransaction(JSON.stringify(body), wallet);
      transaction.addTag("appname", "review-ar");
      transaction.addTag("type", "comment");
      transaction.addTag("id", data.id.toString());
      const response = await signAndDeployTransaction(transaction, wallet);
      if (response.status === 200) {
        this.setState(
          {
            submitting: false,
          },
          () => {
            notification.success({
              message: "Success",
              description: "Successfully!",
            });
          }
        );
        return;
      } else {
        notification.error({
          message: "Error",
          description: "Fail!",
        });
      }
    } catch (err) {
      console.log(err);
      this.setState({ submitting: false }, () => {
        notification.error({
          message: "Error",
          description: "Fail!",
        });
      });
    }
  };
  render() {
    const { data, address } = this.props;
    const { comment, comments, submitting } = this.state;
    return (
      <React.Fragment>
        <Button
          onClick={() => this.props.backAction()}
          style={{ marginBottom: "20px" }}
          type="default"
          shape="circle"
          icon={<LeftOutlined />}
        />
        <div className="item-data">
          <Image width={90} src={data.logo} />
          <div className="item-content">
            <div style={{ marginBottom: "5px" }}>
              <a href="#">{data.name}</a>
            </div>
            <div className="item-info">
              <Rate
                style={{ color: "#333" }}
                disabled
                allowHalf
                defaultValue={2.5}
              />
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "110px" }}>
          <p>{data.des}</p>
        </div>
        <div className="comments">
          {comments && comments.length ? (
            <List
              className="comment-list"
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(item) => (
                <li>
                  <Comment
                    author={renderAddress(item.by)}
                    avatar={
                      <Avatar>{item.by ? item.by.substring(0, 1) : "U"}</Avatar>
                    }
                    content={item.comment}
                    datetime={moment(item.timestamp || Date.now()).fromNow()}
                  />
                </li>
              )}
            />
          ) : null}
          <Comment
            avatar={<Avatar>{address ? address.substring(0, 1) : "U"}</Avatar>}
            content={
              <React.Fragment>
                <Form.Item>
                  <TextArea
                    rows={4}
                    onChange={(e) => this.onChange(e)}
                    value={comment}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    shape="round"
                    htmlType="submit"
                    loading={submitting}
                    onClick={() => this.onSubmit()}
                    type="primary"
                  >
                    Add Comment
                  </Button>
                </Form.Item>
              </React.Fragment>
            }
          />
        </div>
      </React.Fragment>
    );
  }
}

export default Detail;
