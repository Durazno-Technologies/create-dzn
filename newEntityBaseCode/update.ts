import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { __SINGLE__Service } from "../../database/services"
import { Update__SINGLE_TITLE__ } from "../../dtos/__SINGLE_TITLE__Dto"
import schema from "../../../_schemas"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & Update__SINGLE_TITLE__,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    const { body } = event;
    try {
      const __SINGLE__ = await __SINGLE__Service.get__SINGLE_TITLE__(id);
      const updated__SINGLE_TITLE__ = await __SINGLE__Service.update__SINGLE_TITLE__(__SINGLE__.id, body);

      return formatJSONResponse(200, updated__SINGLE_TITLE__);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.Update__SINGLE_TITLE__
);
