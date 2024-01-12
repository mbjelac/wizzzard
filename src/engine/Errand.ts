import { Level } from "./Level";

export interface Errand {

  description: ErrandDescription,
  levelMatrix: string[]

}

export interface ErrandDescription {
  id: string,

  title: string,
  description: string
}
