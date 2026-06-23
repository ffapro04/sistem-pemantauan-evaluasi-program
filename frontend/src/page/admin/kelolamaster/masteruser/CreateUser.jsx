/* eslint-disable no-unused-vars */
import React from "react";
import { MasterFormPage } from "../../../../components/masterCrud";
import { userConfig } from "../../../../config/masterCrud/user.config";

export default function CreateUser() {
  return <MasterFormPage config={userConfig} mode="create" />;
}
