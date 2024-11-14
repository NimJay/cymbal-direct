import { Content, FunctionCallingMode, FunctionCallPart, FunctionDeclarationSchemaType, FunctionResponsePart, Part, Tool, ToolConfig } from "@google-cloud/vertexai";
import { getOrderStatus } from "./order-status";

const TOOL_CONFIG_FOR_GEMINI: ToolConfig = {
  functionCallingConfig: {
    mode: FunctionCallingMode.AUTO,
  },
};

const TOOLS_FOR_GEMINI: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'get_order_status_by_order_reference_number',
        description: 'Get the delivery status of an order by the order reference number.',
        parameters: {
          type: FunctionDeclarationSchemaType.OBJECT,
          properties: {
            orderReferenceNumber: { type: FunctionDeclarationSchemaType.STRING },
          },
          required: ['orderReferenceNumber'],
        },
      },
    ],
  },
];

async function getFunctionResponseParts(
  functionCalls: FunctionCallPart[],
): Promise<FunctionResponsePart[]> {
  return await Promise.all(functionCalls.map(async (functionCall) => {
    const functionName = functionCall.functionCall.name;
    const functionArgs = functionCall.functionCall.args;
    if (functionName === "get_order_status_by_order_reference_number") {
      console.log(`Processing function call for get_order_status_by_order_reference_number.`);
      const { orderReferenceNumber } = functionArgs as { orderReferenceNumber: string };
      const orderStatus = await getOrderStatusByOrderReferenceNumber(orderReferenceNumber);
      return {
        functionResponse: {
          name: functionName,
          response: {
            name: functionName,
            content: { orderStatus }
          },
        }
      }
    }
    throw new Error(`Unknown function call: ${functionName}.`);
  }));
}

/**
 * Get the status of an order in an LLM-friendly format.
 * @param orderReferenceNumber The reference number of the order.
 * @returns A string that's more LLM-friendly that a raw OrderStatus object.
 */
async function getOrderStatusByOrderReferenceNumber(
  orderReferenceNumber: string,
): Promise<string> {
  const orderStatus = await getOrderStatus(orderReferenceNumber);
  if (!orderStatus) {
    return `Invalid order reference number.`;
  }
  let orderStatusString = `Order status: ${orderStatus.status}.`;
  if (orderStatus.status === 'Out for delivery' && orderStatus.estimatedArrivalTimestamp) {
    const dateString = new Date(orderStatus.estimatedArrivalTimestamp).toLocaleDateString();
    orderStatusString += ` Estimated arrival date: ${dateString}`;
  }
  return orderStatusString;
}

export { TOOL_CONFIG_FOR_GEMINI, TOOLS_FOR_GEMINI, getFunctionResponseParts };
