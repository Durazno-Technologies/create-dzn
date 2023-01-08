import { DocumentClient } from "aws-sdk/clients/dynamodb";
import __SINGLE_TITLE__ from "../../models/__SINGLE_TITLE__";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class __SINGLE_TITLE__Service {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAll__SINGLE_TITLE__(options: QueryOptions = { populate: false }): Promise<__SINGLE_TITLE__[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as __SINGLE_TITLE__[];
  }

  async get__SINGLE_TITLE__(id: string, options: QueryOptions = { populate: false }): Promise<__SINGLE_TITLE__> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('__SINGLE_TITLE__ Not Found');
    }

    return result.Item as __SINGLE_TITLE__;
  }

  async create__SINGLE_TITLE__(__SINGLE__: __SINGLE_TITLE__): Promise<__SINGLE_TITLE__> {
    for (const key in __SINGLE__) {
      if (!(key in schema.__SINGLE_TITLE__.properties)) {
        throw new Error(`Property ${key} not compatible with __SINGLE_TITLE__ schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: __SINGLE__,
      })
      .promise();

    return __SINGLE__;
  }

  async update__SINGLE_TITLE__(id: string, partial__SINGLE_TITLE__: Partial<__SINGLE_TITLE__>): Promise<__SINGLE_TITLE__> {
    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression:
        "set",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ReturnValues: "ALL_NEW",
    };
    let propertiesCount = 0;
    for (const key in partial__SINGLE_TITLE__) {
      if (!(key in schema.__SINGLE_TITLE__.properties)) {
        throw new Error(`Property ${key} not compatible with __SINGLE_TITLE__ schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partial__SINGLE_TITLE__[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as __SINGLE_TITLE__;
  }

  async delete__SINGLE_TITLE__(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default __SINGLE_TITLE__Service;
