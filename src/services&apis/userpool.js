import { CognitoUserPool } from "amazon-cognito-identity-js";
const poolData = {
  UserPoolId: "ap-south-1_vxlrNp9Sx",
  ClientId: "2qsuinmt56almqrq94jkodum87",
};
export default new CognitoUserPool(poolData);
