
<?php

enum UserAuthenticationTypes : string {
    case NO_AUTHENTICATION = "NO_AUTHENTICATION";
    case USERNAME_PASSWORD = "USERNAME_PASSWORD";
    case PIN_AUTHENTICATION = "PIN_AUTHENTICATION";
    case EMAIL_AUTHENTICATION = "EMAIL_AUTHENTICATION";
}

enum DayTypes : string
{
    case MONDAY = "Monday";

    case TUESDAY = "Tuesday";

    case WEDNESDAY = "Wednesday";

    case THURSDAY = "Thursday";

    case FRIDAY = "Friday";

    case SATURDAY = "Saturday";

    case SUNDAY = "Sunday";
}

enum PostedTypes : int
{
    case POSTED = 1;
    case NOT_POSTED = 2;
}

enum CancelledTypes : int
{
    case CANCELLED = 1;
    case NOT_CANCELLED = 2;

}

enum PaidTypes : int
{
    case PAID = 1;

    case NOT_PAID = 2;
}
enum ActiveTypes : int
{
    case ACTIVE = 1;
    case NOT_ACTIVE = 2;

}

enum GenderType : string
{
    case MALE = "Male";

    case FEMALE = "Female";
}

enum AdminUserTypes : string
{
    case ADMIN = "Admin";

    case SUPER_ADMIN = "Super Admin";
}

enum UserTypes : string
{
    case STUDENT = "Student";

    case FACULTY = "Faculty";
    case ADMIN = "Admin";
    case SUPER_ADMIN = "Super Admin";
}

enum UserTypesMini : string
{
    case STUDENT = "student";

    case FACULTY = "faculty";
    case ADMIN = "admin";
    case SUPER_ADMIN = "super";
}
enum ActivityLogCategories : int
{

}

enum ActivityLogActionTypes : int
{
    case CREATE = 1;
    case DELETE = 2;
    case UPDATE = 3;
    case INSERT = 4;
    case MODIFY = 5;
    case PRINTS = 6;
}

enum ActivityLogStatus : int
{
    case SUCCESS = 1;
    case FAILED = 2;
}

enum YearLevels : int
{
    case FIRST_YEAR = 1;
    case SECOND_YEAR = 2;
    case THIRD_YEAR = 3;
    case FOURTH_YEAR = 4;
}

enum Semesters : int
{
    case FIRST_SEMESTER = 1;
    case SECOND_SEMESTER = 2;
    case THIRD_SEMESTER = 3;
}


//enum LoanTypes : string
//{
//    case AWDW%AWD
//}

?>


