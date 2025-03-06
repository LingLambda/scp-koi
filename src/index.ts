import { Context, Schema } from "koishi";
import { getSCPInfo, init } from "./Service/PuppUtil";

export const name = "scp-koi";

export const inject = ["puppeteer"];

export interface Config {
  CNURL: boolean;
  // imageMode?: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    CNURL: Schema.boolean()
      .default(true)
      .description("访问国区wiki，关闭后使用主站"),
    // imageMode: Schema.boolean().default(true).description("图片模式"),
  }),
]);

export function apply(ctx: Context, config: Config) {
  init(ctx, config);
  ctx
    .command("SCP <number>", "查询对应编号SCP")
    .action(async ({ session }, number) => {
      await getInfo(session, { number: number });
    })
    .example("SCP 096 查询scp-096");
  ctx
    .command("SCPP <name>", "访问SCP wiki任意页面")
    .action(async ({ session }, name) => {
      await getInfo(session, { name: name });
    })
    .example("SCPP user-curated-lists 访问用户推荐清单页");
}

async function getInfo(
  session,
  options: { name?: string; number?: string } = {}
) {
  session.send("███████（数据删除）");
  const image = await getSCPInfo(options);
  session.send(image);
  return;
}
