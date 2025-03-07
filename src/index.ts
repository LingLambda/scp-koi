import { Context, Schema, Session } from "koishi";
import { getSCPInfo, init } from "./Service/PuppUtil";

export const name = "scp-koi";

export const inject = ["puppeteer"];

export interface Config {
  CNURL?: boolean;
  // imageMode?: boolean;
  accessInfo?: boolean;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    CNURL: Schema.boolean()
      .default(true)
      .description("访问国区wiki，关闭后使用主站"),
    // imageMode: Schema.boolean().default(true).description("图片模式"),
    accessInfo: Schema.boolean()
      .default(true)
      .description("获取scp资料时的确认信息"),
  }),
]);

export function apply(ctx: Context, config: Config) {
  init(ctx, config);
  let { accessInfo } = config;
  ctx
    .command("SCP <number>", "查询对应编号SCP")
    .action(async ({ session }, number) => {
      if (!/^\d+$/.test(number)) {
        await session.send("ERROR:输入必须为数字");
        return;
      }
      await getInfo(session, accessInfo, { number });
    })
    .example("SCP 096 查询scp-096");
  ctx
    .command("SCPP <name>", "访问SCP wiki任意页面")
    .action(async ({ session }, name) => {
      await getInfo(session, accessInfo, { name: name });
    })
    .example("SCPP user-curated-lists 访问用户推荐清单页");
}

async function getInfo(
  session: Session,
  enableInfo: boolean,
  options: { name?: string; number?: string } = {}
) {
  if (enableInfo && options.number) {
    await accessInfo(session, options.number);
  }
  const image = await getSCPInfo(options);
  session.send(image);
  return;
}
async function accessInfo(session, number) {
  session.send("已确认访问SCP-" + number + "权限，正在从就近站点调取数据");
  await session.bot.ctx.sleep(2000);
  session.send(
    "若你误收本资料，务必将终端设备低格并向你的直属上级报备，然后向就近站点申用记忆消除。"
  );
}
