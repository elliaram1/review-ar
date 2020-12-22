import React from "react";
import { List, Image } from "antd";
import {
  EnvironmentFilled,
  InfoCircleFilled,
  RobotFilled,
} from "@ant-design/icons";

const DataComment = (props) => {
  return (
    <List
      itemLayout="vertical"
      size="large"
      bordered={true}
      loading={props.loading}
      pagination={{
        pageSize: 5,
      }}
      dataSource={props.data}
      renderItem={(item) => (
        <List.Item onClick={() => props.onDetail(item)}>
          <div className="item-data">
            <Image width={90} src={item.logo} />
            <div className="item-content">
              <div style={{ marginBottom: "10px" }}>
                <a href="#">{item.name}</a>
              </div>
              <div className="item-info">
                <EnvironmentFilled className="item-icon" />
                <p>{item.address}</p>
                <RobotFilled
                  className="item-icon"
                />
                <p>{item.amount}</p>
              </div>
              <div className="item-info">
                <InfoCircleFilled className="item-icon" />
                <p>{item.des.substring(0, 90) + "..."}</p>
              </div>
            </div>
          </div>
        </List.Item>
      )}
    ></List>
  );
};

export default DataComment;
