export interface EventManija {
  _id?:                       string;
  title:                      string;
  eventDate:                  string;
  alternativeTxtEventDate:    string;
  startTime:                  string;
  finishTime:                 string;
  eventPlace:                 string;
  eventColor:                 string;
  url:                        string;
  section:                    string;
  publish:                    boolean;
  mustBeAutomaticallyDeleted: boolean;
  imgName:                    File | null;
}
