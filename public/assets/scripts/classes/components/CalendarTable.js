import {addHtml, append, ChunkArray, CreateElement} from "../../modules/component/Tool.js";

export class CalendarTable {
    constructor(year, month, events = [], assignments = []) {
        this.currentdate = new Date();
        this.year = year ?? this.currentdate.getFullYear();
        this.month = month ?? this.currentdate.getMonth();
        this.callback = null;
        this.element = this.create();
        this.events = events;
        this.assignments = assignments;

        this.display();
    }

    listen(callback) {
        this.callback = callback;
    }

    create() {
        const obj = this;
        return CreateElement({
            el: "DIV",
            className: "custom-calendar-container",
            childs: [
                CreateElement({
                    el: "DIV",
                    className: "calendar-header",
                    childs: [
                        CreateElement({
                            el: "DIV",
                            className: "left",
                            child: CreateElement({
                                el: "h1",
                                html: "Month"
                            })
                        }),
                        CreateElement({
                            el: "DIV",
                            className: "right",
                            childs: [
                                CreateElement({
                                    el: "DIV",
                                    className: "text-button",
                                    child: [
                                        CreateElement({
                                            el: "DIV",
                                            className: "text",
                                            child: CreateElement({
                                                el: "SPAN",
                                                html: "PREV MONTH"
                                            })
                                        })
                                    ],
                                    listener: {
                                        click: function () {
                                            obj.prev();
                                        }
                                    }
                                }),
                                CreateElement({
                                    el: "DIV",
                                    className: "text-button",
                                    child: [
                                        CreateElement({
                                            el: "DIV",
                                            className: "text",
                                            child: CreateElement({
                                                el: "SPAN",
                                                html: "NEXT MONTH"
                                            })
                                        })
                                    ],
                                    listener: {
                                        click: function () {
                                            obj.next();
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                CreateElement({
                    el: "DIV",
                    className: "calendar-body",
                })
            ]
        });
    }

    display() {
        const obj = this;
        const year = this.year, month = this.month;
        const currdate = this.element.querySelector('.calendar-header h1');
        const body = this.element.querySelector('.calendar-body');

        const days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ];
        const months=[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"];

        const calendar = {
            start: [],
            current: [],
            last: []
        };

        let date= this.currentdate;

        let dayone=new Date(year, month, 1).getDay();

        // get the last date of the month
        let lastdate=new Date(year, month + 1, 0).getDate();

        // get the day of the last date of the month
        let dayend=new Date(year, month, lastdate).getDay();

        // get the last date of the previous month
        let monthlastdate=new Date(year, month, 0).getDate();

        let lit=""; // variable to store the generated calendar HTML


        // loop to add the last dates of the previous month
        for (let i= dayone - 1; i > 0; i--) {
            calendar.start.push(monthlastdate - i);
        }

        // loop to add the dates of the current month
        for (let i= 1; i <=lastdate; i++) {
            // check if the current date is today
            let isToday= i === date.getDate() && month===new Date().getMonth() && year===new Date().getFullYear() ? "active": "";

            calendar.current.push({
                today: isToday,
                day: i
            })
        }

        // loop to add the first dates of the next month
        for (let i= dayend; i < 6; i++) {
            calendar.last.push(i - dayend + 1);
        }

        // update the text of the current date element with the formatted current month and year
        currdate.innerText=`${months[month]} ${year}`;

        calendar.start = calendar.start.map((day) => {
            const mainDate = new Date(year, month, day.day);
            const event = obj.getEvent(mainDate);

            return CreateElement({
                    el: "TD",
                    child: CreateElement({
                        el: "DIV",
                        className: 'day-info',
                        childs: [
                            CreateElement({
                                el: 'DIV',
                                className: ['day', 'tooltip', event.length ? 'unavailable' : ''],
                                childs: [
                                    CreateElement({
                                        el: "SPAN",
                                        html: day
                                    }),
                                    CreateElement({
                                        el: "DIV",
                                        className: 'tooltiptext',
                                        child: CreateElement({
                                            el: "SPAN",
                                            html: `${months[month]} ${day} ${year}`
                                        }),
                                    }),
                                ]
                            }),
                            CreateElement({
                                el: 'DIV',
                                className: 'contents',
                                childs: event.map((ev) => CreateElement({
                                    el: "DIV",
                                    className: 'event-con',
                                    child: CreateElement({
                                        el:"SPAN",
                                        html: `UNAVAILABLE (${ev.from_time}-${ev.to_time}`
                                    })
                                }))
                            }),
                        ]
                    }),
                    listener: { click: () => {
                        this.callback({month: month, day: day, year})
                    }}
                });
        })

        calendar.current = calendar.current.map((day) => {
            const mainDate = new Date(year, month, day.day);
            const event = obj.getEvent(mainDate);
            const assignment = obj.getAssignment(mainDate);


            return CreateElement({
                el: "TD",
                child: CreateElement({
                    el: "DIV",
                    className: 'day-info',
                    childs: [
                        CreateElement({
                            el: 'DIV',
                            className: ['tooltip','day', day.today ? 'active' : 'active-day', event.length ? 'unavailable' : assignment.length ? 'booked' : ''],
                            childs: [
                                CreateElement({
                                    el: "SPAN",
                                    html: day.day
                                }),
                                CreateElement({
                                    el: "DIV",
                                    className: 'tooltiptext',
                                    child: CreateElement({
                                        el: "SPAN",
                                        html: day.today ? 'Today' : `${months[month]} ${day.day} ${year}`
                                    }),
                                }),
                            ]
                        }),
                        CreateElement({
                            el: 'DIV',
                            className: 'all-contents',
                            childs: [...event.map((ev) => CreateElement({
                                el: "DIV",
                                className: 'event-con',
                                child: CreateElement({
                                    el:"SPAN",
                                    html: `UNAVAILABLE (${ev.from_time}-${ev.to_time}`
                                })
                            })), ...assignment.map((as) => CreateElement({
                                el: "DIV",
                                className: 'event-con',
                                child: CreateElement({
                                    el:"SPAN",
                                    html: `${as.branch.name}`
                                })
                            }))]
                        }),
                    ]
                }),
                listener: { click: () => {
                        this.callback({month: month, day: day.day, year})
                    }}

            });
        })

        calendar.last = calendar.last.map((day) => {
            return CreateElement({
                el: "TD",
                child: CreateElement({
                    el: "DIV",
                    className: 'day-info',
                    childs: [
                        CreateElement({
                            el: 'DIV',
                            className: ['day', 'tooltip'],
                            childs: [
                                CreateElement({
                                    el: "SPAN",
                                    html: day
                                }),
                                CreateElement({
                                    el: "DIV",
                                    className: 'tooltiptext',
                                    child: CreateElement({
                                        el: "SPAN",
                                        html: `${months[month]} ${day} ${year}`
                                    }),
                                }),
                            ]
                        }),
                        CreateElement({
                            el: 'DIV',
                            className: 'contents'
                        }),
                    ]
                }),
                listener: { click: () => {
                    this.callback({month: month, day: day, year})
                }}
            });
        })

        const all = [calendar.start, calendar.current, calendar.last].flat(1);

        const content = ChunkArray(all, 7);

        const contents = content.map(tr => CreateElement({
            el: "TR",
            childs: tr
        }))

        const element = CreateElement({
            el: "TABLE",
            className: "calendar-grid-table",
            childs: [
                CreateElement({
                    el: "thead",
                    child: CreateElement({
                        el: "TR",
                        childs: days.map((month) => CreateElement({
                            el: "TH",
                            html: month
                        }))
                    })
                }),
                CreateElement({
                    el: "tbody",
                    childs: contents
                })
            ]
        })

        addHtml(body, "");
        append(body, element)
    }

    getAssignment(mainDate) {
        const assignments = [];

        if (this.assignments.length) {
            for (const assignment of this.assignments) {
                const targetDate = new Date(assignment.target_date);
                const isMatch= mainDate.getDate() === targetDate.getDate() && mainDate.getMonth() === targetDate.getMonth() && mainDate.getFullYear() === targetDate.getFullYear();

                if (isMatch) {
                    assignments.push(assignment);
                }
            }
        }

        return assignments;
    }

    getEvent(mainDate) {
        const events = [];

        if (this.events) {
            for (const event of this.events) {
                const targetDate = new Date(event.target_date);
                const isMatch= mainDate.getDate() === targetDate.getDate() && mainDate.getMonth() === targetDate.getMonth() && mainDate.getFullYear() === targetDate.getFullYear();

                if (isMatch) {
                    events.push(event);
                    console.log(event)
                }
            }
        }

        return events;
    }

    next() {
        this.month++;

        this.updateMonth();

        this.display();
    }

    prev() {
        this.month--;

        this.updateMonth();

        this.display();
    }


    updateMonth() {
        // Check if the month is out of range
        if (this.month < 0 || this.month > 11) {
            // Set the date to the first day of the month with the new year
            this.currentdate = new Date(this.year, this.month, new Date().getDate());
            // Set the year to the new year
            this.year = this.currentdate.getFullYear();
            // Set the month to the new month
            this.month = this.currentdate.getMonth();
        }

        else {
            // Set the date to the current date
            this.currentdate = new Date();
        }
    }
}

// const manipulate=()=> {
//     // get the first day of the month

//
//     // update the HTML of the dates element with the generated calendar
//     day.innerHTML=lit;
// }