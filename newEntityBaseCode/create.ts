import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import * as uuid from "uuid"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { __SINGLE__Service } from "../../database/services"
import { Create__SINGLE_TITLE__ } from "../../dtos/__SINGLE_TITLE__Dto"
import schema from "../../../_schemas"
import __SINGLE_TITLE__ from "../../models/__SINGLE_TITLE__"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & Create__SINGLE_TITLE__,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const id: string = uuid.v4();
      // the latter assignments always win
      const __SINGLE__ = await __SINGLE__Service
        .create__SINGLE_TITLE__({ id, ...(event.body as __SINGLE_TITLE__) });

      return formatJSONResponse(201, __SINGLE__);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.Create__SINGLE_TITLE__
);
