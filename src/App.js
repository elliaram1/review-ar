import React from "react";
import DataComment from "./components/Comment";
import Detail from "./components/Detail";
import {
  getAddressAndBalance,
  getDataByArql,
  renderAddress,
} from "./utils/utils";
import "./App.css";
import { Layout, Modal, Button, notification } from "antd";
const { Header, Content } = Layout;

class App extends React.Component {
  state = {
    loadWallet: false,
    wallet: null,
    address: "",
    openLogin: false,
    loading: true,
    companies: [],
    detail: null,
  };
  async componentDidMount() {
    const companies = await this.getCompany();
    this.setState({ companies, loading: false });
  }

  handleFileUpload = async (e, name) => {
    const rawWallet = await this.readWallet(e.target.files[0]);
    this.setState({ [name]: rawWallet });
  };

  readWallet = (walletFile) => {
    const readAsDataURL = (walletFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          reader.abort();
          reject();
        };
        reader.addEventListener(
          "load",
          () => {
            resolve(reader.result);
          },
          false
        );
        reader.readAsText(walletFile);
      });
    };
    return readAsDataURL(walletFile);
  };

  loadWallet = async () => {
    try {
      this.setState({ loading: true });
      const wallet = this.state.loadWalletData;
      let walletObj = JSON.parse(wallet);
      const { address,
        // balance 
      } = await getAddressAndBalance(walletObj);
      this.setState({
        loading: false,
        loadWallet: true,
        wallet: walletObj,
        address,
        loadWalletData: "",
        openLogin: false,
      });
    } catch (err) {
      this.setState({ loading: false });
      notification.error({
        message: "Error",
        description: 'Load fail!',
      });
    }
  };

  getCompany = async () => {
    try {
      const company = await getDataByArql({
        op: "and",
        expr1: {
          op: "equals",
          expr1: "from",
          expr2: "UUUw1bnLnVH0yqrH1hweCzswduJGsPLFCmCfaOVUAHw",
        },
        expr2: {
          op: "and",
          expr1: {
            op: "equals",
            expr1: "appname",
            expr2: "review-ar",
          },
          expr2: {
            op: "equals",
            expr1: "type",
            expr2: "company",
          },
        },
      });
      return company;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  renderModel = () => {
    const { loading, openLogin } = this.state;
    return (
      <Modal
        title="Login"
        style={{ textAlign: "center" }}
        onCancel={() => this.setState({ openLogin: false })}
        visible={openLogin}
        footer={[
          <Button
            key="back"
            shape="round"
            type="primary"
            className="btn-login"
            onClick={() => this.setState({ openLogin: false })}
          >
            No
          </Button>,
          <Button
            key="submit"
            shape="round"
            type="primary"
            className="btn-login"
            loading={loading}
            onClick={this.loadWallet}
          >
            Yes
          </Button>,
        ]}
      >
        <input
          style={{ paddingBottom: 10 }}
          type="file"
          accept=".json"
          onChange={(e) => {
            this.handleFileUpload(e, "loadWalletData");
          }}
        />
      </Modal>
    );
  };
  render() {
    const { companies, loading, detail, address, wallet } = this.state;
    return (
      <Layout className="layout">
        <Header className="header">
          <div className="container sub-header">
            <h4 className="title">Review Company</h4>
            <div>
              {wallet ? (
                <p>{renderAddress(address)}</p>
              ) : (
                <Button
                  size="large"
                  shape="round"
                  type="primary"
                  className="btn-header"
                  onClick={() => this.setState({ openLogin: true })}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </Header>
        <Content className="container content">
          {this.renderModel()}
          {detail ? (
            <Detail
              data={detail}
              address={address}
              wallet= {wallet}
              backAction={() => this.setState({ detail: null })}
            ></Detail>
          ) : (
            <DataComment
              data={companies}
              loading={loading}
              onDetail={(company) => this.setState({ detail: company })}
            ></DataComment>
          )}
        </Content>
      </Layout>
    );
  }
}

export default App;
