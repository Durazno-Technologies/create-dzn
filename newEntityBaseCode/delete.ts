import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { __SINGLE__Service } from "../../database/services"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    try {
      const __SINGLE__ = await __SINGLE__Service.get__SINGLE_TITLE__(id);
      await __SINGLE__Service.delete__SINGLE_TITLE__(__SINGLE__.id);

      return formatJSONResponse(204);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);
