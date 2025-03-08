export interface EventManija {
  _id?:                       string;
  title:                      string;
  eventDate:                  string | null;
  alternativeTxtEventDate:    string | null;
  startTime:                  string;
  finishTime:                 string;
  eventPlace:                 string;
  eventColor:                 string;
  url:                        string;
  section:                    string;
  publish:                    boolean;
  mustBeAutomaticallyDeleted: boolean;
  imgName:                    string;
  imgMobileName:                    string;
}
