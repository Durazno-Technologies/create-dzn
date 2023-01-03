import { DocumentClient } from "aws-sdk/clients/dynamodb";
import __SINGULAR_NAME__ from "../../models/__SINGULAR_NAME__";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class __SINGULAR_NAME__Service {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAll__SINGULAR_NAME__(options: QueryOptions = { populate: false }): Promise<__SINGULAR_NAME__[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as __SINGULAR_NAME__[];
  }

  async get__SINGULAR_NAME__(id: string, options: QueryOptions = { populate: false }): Promise<__SINGULAR_NAME__> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('__SINGULAR_NAME__ Not Found');
    }

    return result.Item as __SINGULAR_NAME__;
  }

  async create__SINGULAR_NAME__(__SINGULAR_NAME_LOWERCASE__: __SINGULAR_NAME__): Promise<__SINGULAR_NAME__> {
    for (const key in __SINGULAR_NAME_LOWERCASE__) {
      if (!(key in schema.__SINGULAR_NAME__.properties)) {
        throw new Error(`Property ${key} not compatible with __SINGULAR_NAME__ schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: __SINGULAR_NAME_LOWERCASE__,
      })
      .promise();

    return __SINGULAR_NAME_LOWERCASE__;
  }

  async update__SINGULAR_NAME__(id: string, partial__SINGULAR_NAME__: Partial<__SINGULAR_NAME__>): Promise<__SINGULAR_NAME__> {
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
    for (const key in partial__SINGULAR_NAME__) {
      if (!(key in schema.__SINGULAR_NAME__.properties)) {
        throw new Error(`Property ${key} not compatible with __SINGULAR_NAME__ schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partial__SINGULAR_NAME__[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as __SINGULAR_NAME__;
  }

  async delete__SINGULAR_NAME__(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default __SINGULAR_NAME__Service;