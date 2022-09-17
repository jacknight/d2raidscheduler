import { CommandInterface } from "../interfaces/command";
import dungeonCommand from "./dungeon";
import raidCommand from "./raid";

const commandList: CommandInterface[] = [raidCommand, dungeonCommand];

export default commandList;
