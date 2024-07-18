export interface EventManija {
  id:                         string;
  title:                      string;
  eventDate:                  Date;
  alternativeTxtEventDate:    string;
  startTime:                  string;
  finishTime:                 string;
  eventPlace:                 string;
  eventColor:                 string;
  url:                        string;
  section:                    string;
  publish:                    boolean;
  mustBeAutomaticallyDeleted: boolean;
  imgName:                    string;
}
